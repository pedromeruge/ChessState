import React, { useState, useRef, useCallback, useEffect} from 'react';
import { View, Text, ScrollView, StyleSheet, PanResponder, TextStyle, Image, TextInput, Animated, ViewStyle, PanResponderGestureState, GestureResponderEvent} from 'react-native'
import * as Styles from '../../../styles/index.js';

import * as Constants from '../../../constants/index';
import storage from '../../../classes/Storage';
import Preset, { Time } from '../../../classes/timers_base/Preset';
import ActionButton from '../../common/ActionButton';
import Header from '../../common/Header.jsx';
import ActionIcon from '../../common/ActionIcon';
import HorizontalMultiChoice, { ChoiceOption } from '../../common/HorizontalMultiChoice';
import DraggablePiece from './DraggablePiece';
import BoardState, {BoardPiece, PlacedPiece, SideToMove} from '../../../classes/BoardState';
import PresetDetails from './PresetDetails';
import { FischerIncrementStage, FischerIncrementTimer } from '../../../classes/timers_clock_types/FischerIncrement';
import Collapsible from '../../common/Collapsible';

interface StoreNewTimerProps {
  preset?: Preset | null;
  boardScan?: BoardState | null;
}

const CHESSBOARD_PADDING = 7;

const StoreNewTimer = ({preset=null, boardScan=null}: StoreNewTimerProps) => {
  
  //state
  const [title, setTitle] = useState('');
  const playerChoiceRef = useRef(null);
  
  const [gameCreationDate] = useState<Date>(new Date());
  
  //piece related
  const startState = boardScan?.toPlacedPieces() || [];
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>(startState);
  const historyStack = useRef<PlacedPiece[][]>([startState]); // stack to keep track of history for undo functionality

  //refs
  const leftPanelRef = useRef<View>(null);
  const rightPanelRef = useRef<View>(null);
  const boardImageRef = useRef<Image>(null);
  const scrollRef = useRef<ScrollView>(null); // scroll view ref for auto scrolling when expanding details in dropdowns

  const [layout, setLayout] = useState({
    board: { x: 0, y: 0, size: 0, tileSize: 0},
    left:  { x: 0, y: 0 },
    right: { x: 0, y: 0 }
  });

  // Measurement helpers (replace current measure logic):
  const measureLeft = () => {
    leftPanelRef.current?.measureInWindow((x,y,w,h) => {
      if (w || h) setLayout(prev => ({ ...prev, left: { x, y } }));
    });
  };

  const measureRight = () => {
    rightPanelRef.current?.measureInWindow((x,y,w,h) => {
      if (w || h) setLayout(prev => ({ ...prev, right: { x, y } }));
    });
  };

  const measureBoard = () => {
    boardImageRef.current?.measureInWindow((x,y,w,h) => {
      if (w > 0) {
        setLayout(prev => ({
          ...prev,
            board: { x, y, size: w, tileSize: w / 8}
        }));
      }
    });
  };

  // onLayout callbacks:
  const onLeftLayout  = () => requestAnimationFrame(measureLeft);
  const onRightLayout = () => requestAnimationFrame(measureRight);
  const onBoardLayout = () => requestAnimationFrame(measureBoard);

  // handle dropping pieces so they snap to chessboard grid
  const snapToGrid = (e: GestureResponderEvent, gesture: PanResponderGestureState , type: BoardPiece, fromPalette: boolean, id?: string) => {

    const { moveX, moveY } = gesture;
    const { x, y, size, tileSize } = layout.board
    const isInsideBoard = moveX > x && moveX < x + size && moveY > y && moveY < y + size;

    if (isInsideBoard) {
      const col = Math.floor((moveX - x) / tileSize);
      const row = Math.floor((moveY - y) / tileSize);

      //piece was dragged inside the board (from one position to another in the board)
      if (id) { 
        setPlacedPieces(prev => {
          const updated = prev.map(p => 
            p.id === id ? { ...p, tile: { row, col } } : p
          );
          historyStack.current.push(updated);
          return updated;
        });
          console.log("Piece moved in board:", { type, row, col });

      // piece was dragged from the side panel to the board
      } else { 
        setPlacedPieces(prev => {
            const updated = [
              ...prev,
              { id: `${Date.now()}`, type: type, tile: { row, col } }
            ];
            historyStack.current.push(updated);
            return updated;
        });
        console.log("Piece placed from palette to board:", { type, row, col });
      }
      
    // piece dragged from inside the board to outside, to be removed
    } else {
      if (id) { // Only remove pieces that were already on the board
        setPlacedPieces(prev => {
          const updated = prev.filter(p => p.id !== id);
          historyStack.current.push(updated);
          return updated;
        });
      }
    }
  };

  const onChangeTitle = useCallback((text: string) => {
      setTitle(text);
  }, []);

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
    // create new board
    const savedBoard: BoardState = new BoardState(SideToMove.WHITE)
    savedBoard.loadPlacedPieces(placedPieces.map(p => ({
      type: p.type,
      tile: p.tile,
      id: p.id
    })));

    savedBoard.setSideToMove(playerChoiceRef.current?.getSelectedValue() as SideToMove || SideToMove.WHITE);
    console.log("Pressed save")
  };

  // bookmark the game
  const onPressBookmark = () => {
    console.log("Bookmark pressed");
  };

  const onPressRotate = () => {
    setPlacedPieces(prev => {
      const updated = prev.map(p => ({
        ...p,
        tile: { row: p.tile.col, col: 7 - p.tile.row } // rotate 90 degrees clockwise
      }));
      historyStack.current.push(updated);
      return updated;
    });
    console.log("Rotate pressed");
  }

  const onPressClear = () => {
    setPlacedPieces(prev => {
      historyStack.current.push(prev);
      return [];
    });

    console.log("Clear pressed");
  };

  const onPressUndo = () => {
    setPlacedPieces(prev => {
      console.log("History stack before undo:", historyStack.current);
      if (historyStack.current.length > 1) {
        historyStack.current.pop(); // remove current state
        const previous = historyStack.current[historyStack.current.length - 1];
        return previous;
      }
      return prev; // no change if no history
    });

    console.log("Undo pressed");
  };

  const nextPlayerOptions: ChoiceOption[] = [
    { icon: Constants.icons.light_king, text: 'White', value: SideToMove.WHITE},
    { icon: Constants.icons.dark_king, text: 'Black', value: SideToMove.BLACK}
  ];

  const testPreset = Preset.samePlayerTimers(new FischerIncrementTimer([new FischerIncrementStage(new Time(0, 1, 0), new Time(0, 0, 1)), new FischerIncrementStage(new Time(0, 2, 0), new Time(0, 1, 30)), new FischerIncrementStage(new Time(0, 2, 0), new Time(0, 1, 30))]),"lalala");
  testPreset.timers[0].currentStage = 1;
  testPreset.timers[0].currentStageTime = 4000; // 45 seconds left in current stage
  
  return (
    <View style={styles.page}>
      <Header 
        leftIcon={Constants.icons.pawn} 
        leftIconSize={16} text={'Save match'} 
        rightIcon={Constants.icons.arrow_left} 
        rightIconSize={18} 
        lowBorder={true}/>
      <ScrollView 
          ref={scrollRef}
          contentContainerStyle={{flexGrow: 1, width: '100%', alignItems: 'center'}} 
          style={{width: '100%'}}
          stickyHeaderIndices={[2]} // make tabs sticky
        >
        <View style={styles.prebodyContent}>
          <View style={styles.topPannel}> 
            <View style={styles.iconGroup}>
              <ActionIcon
                source_on={Constants.icons.rotate} 
                tintColor={Constants.COLORS.preset_blue} 
                onPress={onPressRotate}
                hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
                width={30}
                disabled={placedPieces.length === 0}
              />
              <Text style={[styles.iconText, placedPieces.length === 0 ? Styles.common.disabled : null]}>Rotate 90º</Text>
            </View>
            <View style={styles.iconGroup}>
              <ActionIcon
                source_on={Constants.icons.clear} 
                tintColor={Constants.COLORS.preset_blue} 
                onPress={onPressClear}
                hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
                width={30} 
                disabled={placedPieces.length === 0}
              />
              <Text style={[styles.iconText, placedPieces.length === 0 ? Styles.common.disabled : null]}>Clear board</Text>
            </View>
            <View style={styles.iconGroup}>
              <ActionIcon
                source_on={Constants.icons.undo} 
                tintColor={Constants.COLORS.preset_blue} 
                width={25} 
                disabled={historyStack.current.length === 1 && placedPieces.length === 0}
                onPress={onPressUndo}
                hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
              />
              <Text style={[
                styles.iconText, 
                (historyStack.current.length === 1 && placedPieces.length === 0) ? Styles.common.disabled : null
              ]}>Undo step</Text>
            </View>
          </View>
          <View style={styles.bottomPanel}>
            <View ref={leftPanelRef} onLayout={onLeftLayout} style={styles.piecesPanel}>
              {Array.from(
                [BoardPiece.LIGHT_PAWN, BoardPiece.LIGHT_BISHOP, BoardPiece.LIGHT_KNIGHT, BoardPiece.LIGHT_ROOK, BoardPiece.LIGHT_QUEEN, BoardPiece.LIGHT_KING], (piece, i) => (
                <DraggablePiece
                  key={i}
                  type={piece}
                  fromPalette={true}
                  rootLayout={layout.left}
                  boardLayout={{ boardPadding: CHESSBOARD_PADDING, tileSize: layout.board.tileSize }}
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
                  boardLayout={{ boardPadding: CHESSBOARD_PADDING, tileSize: layout.board.tileSize }}
                  rootLayout={{x:layout.board.x, y: layout.board.y}}
                  onDrop={snapToGrid}
                />
              ))}
            </View>
            <View ref={rightPanelRef} onLayout={onRightLayout} style={styles.piecesPanel}>
              {Array.from(
                [BoardPiece.DARK_PAWN, BoardPiece.DARK_BISHOP, BoardPiece.DARK_KNIGHT, BoardPiece.DARK_ROOK, BoardPiece.DARK_QUEEN, BoardPiece.DARK_KING], (piece, i) => (
                <DraggablePiece
                  key={i}
                  type={piece}
                  fromPalette={true}
                  boardLayout={{ boardPadding: CHESSBOARD_PADDING, tileSize: layout.board.tileSize }}
                  rootLayout={layout.right}
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
                title={"Next move"}
                ref={playerChoiceRef}
              />
            </View>
          </View>
        </View>
        <Collapsible
          collapsedLabel="Show timer details"
          expandedLabel="Hide timer details"
          iconCollapsed={Constants.icons.arrow_down}
          iconExpanded={Constants.icons.arrow_up}
          scrollViewRef={scrollRef}
          autoScroll={true}
          hideHeaderWhenExpanded={false}
          containerStyle={[styles.dropdownContent]}
          headerStyle={[Styles.common.subSectionContainerPadding, {paddingHorizontal: 0}]}
        >
          <PresetDetails preset={testPreset} />
        </Collapsible>
        {/* to provide spacing for the sticky save button */}
        <View style={[styles.buttonContainer, Styles.common.pageBottomPadding]}>
          <ActionButton 
            source={Constants.icons.box_full} 
            text="Save" 
            height={45} 
            iconSize={20} 
            fontSize={Constants.SIZES.xxLarge} 
            onPress={onPressSave}
            disabled={!allFieldsFilled()}
            componentStyle={styles.buttonContent}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({

  page: {
    backgroundColor: Constants.COLORS.text_grey,
    alignItems: 'center',
    width: '100%',
    flex: 1
  },

  prebodyContent: {
    width: '100%',
    zIndex: 1
  },

  topPannel: {
    marginTop: 7.5,
    flexDirection: 'row',
    paddingHorizontal: '10%',
    justifyContent: 'space-around',
    marginBottom: 10,
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

  bottomPanel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  piecesPanel: {
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
    marginTop: -40, // negative margin to pull it up behind the chessboard!
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
  },

  dropdownContent: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: Constants.COLORS.white,
  },

  dropdownHeader: {
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Constants.COLORS.white,    
    paddingTop: 30,
  },

  buttonContent: {
    alignSelf:'center',
  }

})

export default StoreNewTimer;