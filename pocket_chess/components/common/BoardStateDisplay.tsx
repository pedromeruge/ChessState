import React, { useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import * as Constants from '../../constants';
import { BoardPieceToUnicode, PlacedPiece } from '../../classes/BoardState';
import * as Styles from '../../styles';

interface BoardStateDisplayProps {
  placedPieces: PlacedPiece[];
  onPress?: () => void; // Callback to open edit modal
  style?: any;
}

export const CHESSBOARD_PADDING = 8;

const BoardStateDisplay: React.FC<BoardStateDisplayProps> = ({ placedPieces, onPress, style }) => {

    //refs
    const boardImageRef = useRef<Image>(null); // ref to chessboard, to calculate dimensions
    
    //state
    const [boardTileSize, setBoardTileSize] = React.useState(0); // size of each chessboard tile
    
    const measureBoard = () => {
        boardImageRef.current?.measureInWindow((x,y,w,h) => {
        if (w > 0) {
            setBoardTileSize(w / 8);
        }
        });
    }
    
    // re-measure on layout changes
    const onBoardLayout = () => requestAnimationFrame(measureBoard);

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
            <View style={[styles.chessboardContainer, Constants.SHADOWS.preset]}>
                <Image 
                    source={Constants.images.empty_chessboard} 
                    style={styles.chessboard} 
                    ref={boardImageRef}
                    onLayout={onBoardLayout}
                />
                {/* Render pieces statically */}
                {placedPieces.map(p => (
                <View
                    key={p.id}
                    style={[
                        styles.piece,
                        {
                            left: p.tile.col * boardTileSize + CHESSBOARD_PADDING,
                            top: p.tile.row * boardTileSize + CHESSBOARD_PADDING,
                        }
                    ]}
                >
                    {/* Render piece icon statically */}
                    <Image 
                        source={Constants.icons[BoardPieceToUnicode[p.type] as keyof typeof Constants.icons]} 
                        style={Styles.common.chessboardPieceIconSize} />
                </View>
                ))}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  chessboardContainer: {
    backgroundColor: Constants.COLORS.white,
    padding: CHESSBOARD_PADDING,
    borderRadius: 12,
    aspectRatio: 1,
    width: '85%', // smaller for default view
  },

  chessboard: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
  },

  piece: {
    position: 'absolute',
    width: '12.5%', // 1/8 of board
    height: '12.5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BoardStateDisplay;