// Board state representation

export enum SideToMove {
    WHITE = 'white',
    BLACK = 'black'
}

export enum BoardPiece {
  EMPTY,
  LIGHT_PAWN,
  LIGHT_KNIGHT,
  LIGHT_BISHOP,
  LIGHT_ROOK,
  LIGHT_QUEEN,
  LIGHT_KING,
  DARK_PAWN,
  DARK_KNIGHT,
  DARK_BISHOP,
  DARK_ROOK,
  DARK_QUEEN,
  DARK_KING
};

export const BoardPieceToUnicode: Record<BoardPiece, string> = {
  [BoardPiece.EMPTY]: 'empty',
  [BoardPiece.LIGHT_PAWN]: 'light_pawn',
  [BoardPiece.LIGHT_KNIGHT]: 'light_knight',
  [BoardPiece.LIGHT_BISHOP]: 'light_bishop',
  [BoardPiece.LIGHT_ROOK]: 'light_rook',
  [BoardPiece.LIGHT_QUEEN]: 'light_queen',
  [BoardPiece.LIGHT_KING]: 'light_king',
  [BoardPiece.DARK_PAWN]: 'dark_pawn',
  [BoardPiece.DARK_KNIGHT]: 'dark_knight',
  [BoardPiece.DARK_BISHOP]: 'dark_bishop',
  [BoardPiece.DARK_ROOK]: 'dark_rook',
  [BoardPiece.DARK_QUEEN]: 'dark_queen',
  [BoardPiece.DARK_KING]: 'dark_king'
};

export interface PlacedPiece {
  id?: string; 
  type: BoardPiece; // piece type
  tile: { row: number; col: number }; // tile where it is placed
}

export default class BoardState {
  private squares: Uint8Array; // each piece only goes from type 0–12
  private side: SideToMove; // which player is to move

  constructor(side: SideToMove = SideToMove.WHITE, pieces: PlacedPiece[] = []) {
    this.squares = new Uint8Array(64);
    this.side = side;
    if (pieces) { this.loadPlacedPieces(pieces); }
  }

  static index(row: number, col: number) {
    return row * 8 + col;
  }

  setSideToMove(side: SideToMove) {
    this.side = side;
  }

  getSideToMove() {
    return this.side;
  }

  clear() {
    this.squares.fill(0);
  }

  setPiece(row: number, col: number, type: BoardPiece) {
    if (row < 0 || row > 7 || col < 0 || col > 7) throw new Error('Invalid tile');
    if (!(type in BoardPiece)) throw new Error('Invalid piece type');
    this.squares[BoardState.index(row,col)] = type;
  }

  removePiece(row: number, col: number) {
    this.squares[BoardState.index(row,col)] = 0;
  }

  loadPlacedPieces(pieces: PlacedPiece[]) {
    this.clear();
    for (const p of pieces) {
      this.setPiece(p.tile.row, p.tile.col, p.type);
    }
  }

  toPlacedPieces(): PlacedPiece[] {
    const out: PlacedPiece[] = [];

    for (let i=0;i<64;i++) {
      const code = this.squares[i];
      if (code === BoardPiece.EMPTY) continue;

      const type = code;
      const row = Math.floor(i/8);
      const col = i % 8;

      out.push({ id: `${row}-${col}-${type}`, type, tile: { row, col }});
    }

    return out;
  }

  //pack a square in 4 bit, since it goes from type 0-12 (<16), so 2 chess tiles per byte
  //output is player to move (1 byte), followed by 32 bytes for 64 tile types
  serialize(): string {

    const bytes = new Uint8Array(33); // 7 bit padding (can be for versioning later) + 1 bit side to move + 2 tiles per byte, 64 tiles total

    // packing 2 tile types per byte
    for (let i = 0; i < 64; i += 2) {
      const left4bits = this.squares[i] & 0x0f; // converts to 4 bit value
      const right4bits = this.squares[i + 1] & 0x0f;
      bytes[i / 2 + 1] = (left4bits << 4) | right4bits; // left shift a by 4 and combine with b, add 1 since first byte is for side to move
    }

    // packing the side to move in the last byte
    const sideToMove = this.side === 'white' ? 0 : 1; // 0 for white, 1 for black
    bytes[0] = 0; // clear last byte
    bytes[0] = (sideToMove & 0x01)

    // convert to base64
    const bin = String.fromCharCode.apply(null,bytes); 
    const b64 = typeof btoa !== 'undefined'
      ? btoa(bin)
      : Buffer.from(bytes).toString('base64'); // convert to base64 string

    return b64;
  }

  static deserialize(data: string): BoardState {
    if (!data || data.length < 2) throw new Error('Invalid board data');

    // version is stored in first byte's first 7 bits
    const version = data.charCodeAt(0) & 0xfe;
    if (version !== 0) throw new Error('Unsupported version');

    // side to move is stored in first byte's last bit
    const sideChar: SideToMove = data.charCodeAt(0) & 0x01 ? SideToMove.BLACK : SideToMove.WHITE;

    // board pieces in remaining 32 bytes
    const b64 = data.slice(1);
    const raw = typeof atob !== 'undefined'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('binary'); // decode from base64 to binary string

    if (raw.length !== 32) throw new Error('Corrupt board payload'); // if not exactly 32 bytes, something is wrong

    const state = new BoardState(sideChar);

    for (let i = 0; i < 32; i++) {
      const byte = raw.charCodeAt(i);
      state.squares[i * 2] = (byte >> 4) & 0x0f; // get 4 leftmost bits and shift them right 4 bits, then mask them to get the value for the left stored tile
      state.squares[i * 2 + 1] = byte & 0x0f; // get 4 rightmost bits
    }

    return state;
  }
}