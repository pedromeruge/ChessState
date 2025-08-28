import React, { useState, useRef, useCallback, useEffect} from 'react';
import { View, Text, ScrollView, StyleSheet, PanResponder, TextStyle, Image, TextInput, Animated, ViewStyle, PanResponderGestureState, GestureResponderEvent} from 'react-native'
import * as Styles from '../../../styles/index.js';

import * as Constants from '../../../constants/index';
import storage from '../../../classes/Storage';
import Preset from '../../../classes/timers_base/Preset';
import ActionButton from '../../common/ActionButton';
import Header from '../../common/Header.jsx';
import IconComponent from '../../common/IconComponent';
import ActionIcon from '../../common/ActionIcon';
import HorizontalMultiChoice, { ChoiceOption } from '../../common/HorizontalMultiChoice';
import DraggablePiece, {ContainerLayout} from './DraggablePiece';

interface PlacedPiecesProps {
  id: string,
  type: string, 
  tile: {
    row: number,
    col: number
  }
}

interface StoreNewTimerProps {
  preset?: Preset | null;
  boardScan?: string | null; // TODO: represent a chessboard scan
}

const CHESSBOARD_PADDING = 7;

const StoreNewTimer = ({preset=null, boardScan=null}: StoreNewTimerProps) => {

  //state
  const [title, setTitle] = useState('');
  const [nextPlayer, setNextPlayer] = useState('white');
  const [gameCreationDate] = useState<Date>(new Date());

  //piece related
  const [placedPieces, setPlacedPieces] = useState<PlacedPiecesProps[]>([]);
  // const chessboardLayout = useRef<BoardLayout>({x: 0, y: 0, size: 0, tileSize: 0});

  const leftPanelRef = useRef<View>(null);
  const rightPanelRef = useRef<View>(null);
  const boardImageRef = useRef<Image>(null);

  const boardLayoutRef = useRef({
    board: { x: 0, y: 0, size: 0, tileSize: 0 },
    left: { x: 0, y: 0, size: 0, tileSize: 0 },
    right: { x: 0, y: 0, size: 0, tileSize: 0 }
  });
// Remove: const chessboardLayout = useRef<BoardLayout>(...) and containersOffset state

// Measurement helpers (replace current measure logic):
const measureLeft = () => {
  leftPanelRef.current?.measureInWindow((x,y,w,h) => {
    if (w || h) {
      boardLayoutRef.current.left = { x, y, size: w, tileSize: w / 8 };
    }
  });
};
const measureRight = () => {
  rightPanelRef.current?.measureInWindow((x,y,w,h) => {
    if (w || h) {
      boardLayoutRef.current.right = { x, y, size: w, tileSize: w / 8 };
    }
  });
};
const measureBoard = () => {
  boardImageRef.current?.measureInWindow((x,y,w,h) => {
    if (w > 0) {
      boardLayoutRef.current.board = { x, y, size: w, tileSize: w / 8 };
      boardLayoutRef.current.left.tileSize = w / 8; // update left container tileSize
      boardLayoutRef.current.right.tileSize = w / 8; // update right container tileSize
    }
  });
};

// onLayout callbacks (replace old ones):
const onLeftLayout  = () => requestAnimationFrame(measureLeft);
const onRightLayout = () => requestAnimationFrame(measureRight);
const onBoardLayout = () => requestAnimationFrame(measureBoard);


  // handle dropping pieces so they snap to chessboard grid
  const snapToGrid = (e: GestureResponderEvent, gesture: PanResponderGestureState , type: string, fromPalette: boolean, id?: string) => {

    const { moveX, moveY } = gesture;
    const { x, y, size, tileSize } = boardLayoutRef.current.board;
    const isInsideBoard = moveX > x && moveX < x + size && moveY > y && moveY < y + size;

    if (isInsideBoard) {
      const col = Math.floor((moveX - x) / tileSize);
      const row = Math.floor((moveY - y) / tileSize);

      //piece was dragged inside the board (from one position to another in the board)
      if (id) { 
        setPlacedPieces(prev => prev.map(p => 
          p.id === id ? { ...p, tile: { row, col } } : p
        ));
          console.log("Piece moved in board:", { type, row, col });

      // piece was dragged from the side panel to the board
      } else { 
        setPlacedPieces(prev => [
          ...prev,
          { id: `${Date.now()}`, type: type, tile: { row, col } }
        ]);
        console.log("Piece placed from palette to board:", { type, row, col });
      }
      
    // piece dragged from inside the board to outside, to be removed
    } else {
      if (id) { // Only remove pieces that were already on the board
        setPlacedPieces(prev => prev.filter(p => p.id !== id));
      }
    }
  };
  
  const onChangeTitle = (text: string) => {
      setTitle(text);
  };
  
  const allFieldsFilled = useCallback(() => {
    return title !== '';
  }, [title]);

  
  // timestamp string formatting
  const getFormattedTimestamp = (date: Date): string => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1); // JS months are 0-11
    const year = date.getFullYear();

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} - ${hours}h ${minutes}m ${seconds}s`;
  };

  // save game to storage
  const onPressSave = async () => {
    console.log("Pressed save")
  };

  // bookmark the game
  const onPressBookmark = () => {
    console.log("Bookmark pressed");
  };

  const onPressRotate = () => {
    console.log("Rotate pressed");
  }

  const onPressClear = () => {
    console.log("Clear pressed");
  };

  const onPressUndo = () => {
    console.log("Undo pressed");
  };

  const nextPlayerOptions: ChoiceOption[] = [
    { icon: Constants.icons.light_king, text: 'White', value: 'white' },
    { icon: Constants.icons.dark_king, text: 'Black', value: 'black' }
  ];

  return (
    <View style={styles.page}>
      <Header 
        leftIcon={Constants.icons.pawn} 
        leftIconSize={16} text={'Save match'} 
        rightIcon={Constants.icons.arrow_left} 
        rightIconSize={18} 
        lowBorder={true}/>
      <View style={styles.prebodyContent}>
        <View style={styles.topPannel}>
          <View style={styles.iconGroup}>
            <ActionIcon
              source_on={Constants.icons.rotate} 
              tintColor={Constants.COLORS.preset_blue} 
              onPress={onPressRotate}
              hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
              width={30}
            />
            <Text style={styles.iconText}>Rotate 90º</Text>
          </View>
          <View style={styles.iconGroup}>
            <ActionIcon
              source_on={Constants.icons.clear} 
              tintColor={Constants.COLORS.preset_blue} 
              onPress={onPressClear}
              hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
              width={30} 
            />
            <Text style={styles.iconText}>Clear board</Text>
          </View>
          <View style={styles.iconGroup}>
            <ActionIcon
              source_on={Constants.icons.undo} 
              tintColor={Constants.COLORS.preset_blue} 
              width={25} 
              onPress={onPressUndo}
              hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
            />
            <Text style={styles.iconText}>Undo step</Text>
          </View>
        </View>
        <View style={styles.bottomPannel}>
          <View ref={leftPanelRef} onLayout={onLeftLayout} style={styles.piecesPannel}>
            {Array.from(
              ['light_pawn', 'light_bishop', 'light_knight', 'light_rook', 'light_queen', 'light_king'], (piece, i) => (
              <DraggablePiece
                key={i}
                type={piece}
                fromPalette={true}
                rootLayoutRef={boardLayoutRef}
                containerKey='left'
                boardPadding={CHESSBOARD_PADDING}
                onDrop={snapToGrid}
              />
            ))}
          </View>
          <View 
            style={[styles.chessboardContainer, Constants.SHADOWS.preset]}
          >
            <Image
              ref={boardImageRef}
              onLayout={onBoardLayout}
              source={Constants.images.empty_chessboard}
              style={styles.chessboard}
            />
            {/* Render the pieces that are already on the board */}
            {placedPieces.map(p => (
              <DraggablePiece
                key={p.id}
                id={p.id}
                type={p.type}
                tile={p.tile}
                containerKey='board'
                rootLayoutRef={boardLayoutRef}
                boardPadding={CHESSBOARD_PADDING}
                onDrop={snapToGrid}
              />
            ))}
          </View>
          <View ref={rightPanelRef} onLayout={onRightLayout} style={styles.piecesPannel}>
            {Array.from(
              ['dark_pawn', 'dark_bishop', 'dark_knight', 'dark_rook', 'dark_queen', 'dark_king'], (piece, i) => (
              <DraggablePiece
                key={i}
                type={piece}
                fromPalette={true}
                rootLayoutRef={boardLayoutRef}
                boardPadding={CHESSBOARD_PADDING}
                containerKey='right'
                onDrop={snapToGrid}
              />
            ))}
          </View>
        </View>
      </View>
      <View style={styles.bodyContent}>
        <View style={styles.legendContainer}>
          <Text style={styles.legendText}>{getFormattedTimestamp(gameCreationDate)}</Text>
          <View style={styles.legendIcon}>
            <ActionIcon 
              source_on={Constants.icons.bookmark_full} 
              source_off={Constants.icons.bookmark} 
              onPress={onPressBookmark}
              startOn={false}
              width={25} 
              tintColor={Constants.COLORS.preset_blue}
            />
          </View>

        </View>
        <View style={Styles.newPreset.sectionContainer}>
          <View style={Styles.newPreset.sectionTitleContainer}>
              <Text style={Styles.newPreset.sectionTitleText}>Title</Text>
          </View>
          <View style={Styles.newPreset.sectionContent}>
              <Text style={Styles.newPreset.titleText}>Name:</Text>
              <TextInput 
                  style={[Styles.newPreset.titleInput]} 
                  placeholder="New preset" 
                  placeholderTextColor={Constants.COLORS.line_light_grey}
                  onChangeText={onChangeTitle}
                  value={title}
                  />
          </View>
        </View>
        <View style={Styles.newPreset.sectionContainer}>
          <View style={Styles.newPreset.sectionTitleContainer}>
              <Text style={Styles.newPreset.sectionTitleText}>Move</Text>
          </View>
          <View style={styles.nextPlayerContainer}>
            <HorizontalMultiChoice 
              options={nextPlayerOptions}
              onSelect={setNextPlayer}
              title={"Next move"}
            />
          </View>
        </View>

        <ActionButton 
          source={Constants.icons.box_full} 
          text="Save" 
          height={45} 
          iconSize={20} 
          fontSize={Constants.SIZES.xxLarge} 
          componentStyle={{marginTop: 30}}
          onPress={onPressSave}
          disabled={!allFieldsFilled()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

  page: {
    backgroundColor: Constants.COLORS.text_grey,
    flex: 1,
    alignItems: 'center',
  },

  prebodyContent: {
    height: '45%',
    width: '100%',
    zIndex: 1
  },

  topPannel: {
    marginTop: 7.5,
    flexDirection: 'row',
    paddingHorizontal: '10%',
    justifyContent: 'space-around',
    paddingBottom: 20,
    zIndex: 2 // to allow hitSlop to extend downwards for the top row icons
  },

  iconGroup: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  iconText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.small,
    fontWeight: Constants.FONTS.medium as TextStyle['fontWeight'],
    color: Constants.COLORS.preset_blue,
  },

  bottomPannel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  piecesPannel: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
    rowGap: '2.2%',
  },

  pieceButton: {
    width: '75%', 
    aspectRatio: 1, 
    alignItems: 'center'
  },

  chessboardContainer: {
    flex: 6,
    backgroundColor: Constants.COLORS.white,
    padding: CHESSBOARD_PADDING,
    borderRadius: 12,
    aspectRatio: 1,
  },

  chessboard: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
    objectFit: 'contain'
  },

  bodyContent: {
    flex: 1,
    width: '100%',
    backgroundColor: Constants.COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // negative margin to pull it up behind the chessboard!
    paddingTop: 35,
    alignItems: 'center',
  },

  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },

  legendText: {
    fontFamily: Constants.FONTS.BASE_FONT_NAME,
    fontSize: Constants.SIZES.medium,
    fontWeight: Constants.FONTS.semi_bold as TextStyle['fontWeight'],
    color: Constants.COLORS.text_grey
  },

  legendIcon: {
    position: 'absolute',
    right: '4%',
  },

  nextPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  }
})

export default StoreNewTimer;