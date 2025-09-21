import React, { useState, useRef, useCallback } from 'react';
import { View, Modal, StyleSheet, ScrollView, Text, TouchableOpacity, Image, TextStyle, PanResponderGestureState, GestureResponderEvent } from 'react-native';
import * as Constants from '../../../constants';
import * as Styles from '../../../styles/index.js';
import ActionIcon from '../../common/ActionIcon';
import ActionButton from '../../common/ActionButton';
import DraggablePiece from './DraggablePiece';
import { PlacedPiece, BoardPiece, SideToMove } from '../../../classes/BoardState';
import { CHESSBOARD_PADDING } from '../../common/BoardStateDisplay';
import Header from '../../common/Header';
import { router, useLocalSearchParams } from 'expo-router';
import Storage from '../../../classes/Storage';

export const TEMP_STORAGE_KEY = 'store_new_timer_placed_pieces'; // key to store temporary pieces data between pages

const BoardStateEdit = () => {

    const initialPieces = Storage.getTempData<PlacedPiece[]>(TEMP_STORAGE_KEY) || []; // router params to indicate necessary refresh

    // pieces state
    const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>(initialPieces);
    const historyStack = useRef<PlacedPiece[][]>([initialPieces]);

    //refs
    const whitePiecesSectionRef = useRef<View>(null);
    const blackPiecesSectionRef = useRef<View>(null);
    const boardImageRef = useRef<Image>(null);

    const [layout, setLayout] = useState({
        board: { x: 0, y: 0, size: 0, tileSize: 0 },
        left: { x: 0, y: 0 },
        right: { x: 0, y: 0 }
    });

    // measure board dimensions and position
    const measureLeft = () => {
        whitePiecesSectionRef.current?.measureInWindow((x,y,w,h) => {
        if (w || h) setLayout(prev => ({ ...prev, left: { x, y } }));
        });
    };

    const measureRight = () => {
        blackPiecesSectionRef.current?.measureInWindow((x,y,w,h) => {
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
    const onWhitePiecesSection = () => requestAnimationFrame(measureLeft);
    const onBlackPiecesSection = () => requestAnimationFrame(measureRight);
    const onBoardLayout = () => requestAnimationFrame(measureBoard);

    // handle dropping pieces so they snap to chessboard grid
    const snapToGrid = (e: GestureResponderEvent, gesture: PanResponderGestureState, type: BoardPiece, fromPalette: boolean, id?: string) => {
        const { moveX, moveY } = gesture;
        const { x, y, size, tileSize } = layout.board;
        const isInsideBoard = moveX > x && moveX < x + size && moveY > y && moveY < y + size;

        if (isInsideBoard) {
        const col = Math.floor((moveX - x) / tileSize);
        const row = Math.floor((moveY - y) / tileSize);
        
        //piece was dragged inside the board (from one position to another in the board)
        if (id) {
            setPlacedPieces(prev => {
                const updated = prev.map(p => p.id === id ? { ...p, tile: { row, col } } : p);
                historyStack.current.push(updated);
                return updated;
            });
        
        // piece was dragged from the side panel to the board
        } else {
            setPlacedPieces(prev => {
                const updated = [...prev, { id: `${Date.now()}`, type, tile: { row, col } }];
                historyStack.current.push(updated);
                return updated;
            });
        }

        // piece dragged from inside the board to outside, to be removed
        } else if (id) {
            setPlacedPieces(prev => {
                const updated = prev.filter(p => p.id !== id);
                historyStack.current.push(updated);
                return updated;
            });
        }
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
    };

    const onPressClear = () => {
        setPlacedPieces(prev => {
            historyStack.current.push(prev);
            return [];
        });
        console.log("Clear pressed");

    };

    const onPressUndo = () => {
        setPlacedPieces(prev => {
            console.log("History stack before undo:", historyStack.current.length);
            if (historyStack.current.length > 1) {
                historyStack.current.pop(); // remove current state
                const previous = historyStack.current[historyStack.current.length - 1];
                return previous;
            }
            return prev; // no change if no history
        });
        console.log("Undo pressed");
    };

      // handle save edits to board in edit modal
      const onSave = () => {
        Storage.setTempData<PlacedPiece[]>(TEMP_STORAGE_KEY, placedPieces); // save changes to temporary storage to be retrieved in StoreNewTimer
        router.back();
      };
    
      // handle ask for rescan in edit modal
      const onRescan = () => {
        // TODO: rescan logic (back to scan screen)
        console.log('Rescan chessboard');
      };

    return (
        <View style={[styles.page, Styles.common.pageBottomPadding]}>
            <Header 
                leftIcon={Constants.icons.pawn} 
                leftIconSize={16} text={'Save match'} 
                rightIcon={Constants.icons.arrow_left} 
                rightIconSize={18} 
                lowBorder={true}
            />
            <View style={[styles.content, Styles.common.pageTopPadding]}>
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
                            disabled={historyStack.current.length === 1}
                            onPress={onPressUndo}
                            hitSlop={{top: 10, bottom: 25, left: 25, right: 25}}
                        />
                        <Text style={[
                            styles.iconText, 
                            (historyStack.current.length === 1) ? Styles.common.disabled : null
                        ]}>Undo step</Text>
                    </View>
                </View>
                <View style={styles.chessboardSection}>
                    <View style={[styles.chessboardContainer, Constants.SHADOWS.preset]}>
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
                </View>

                {/* Pieces Section (2 horizontal rows) */}
                <View style={styles.piecesSection}>
                    <View ref={whitePiecesSectionRef} onLayout={onWhitePiecesSection} style={styles.piecesPanel}>
                        {[BoardPiece.LIGHT_PAWN, BoardPiece.LIGHT_BISHOP, BoardPiece.LIGHT_KNIGHT, BoardPiece.LIGHT_ROOK, BoardPiece.LIGHT_QUEEN, BoardPiece.LIGHT_KING].map((piece, i) => (
                            <View key={i} style={styles.pieceWrapper}>
                                <DraggablePiece
                                    key={i}
                                    type={piece}
                                    fromPalette={true}
                                    rootLayout={layout.left}
                                    boardLayout={{ boardPadding: CHESSBOARD_PADDING, tileSize: layout.board.tileSize }}
                                    onDrop={snapToGrid}
                                />
                            </View>
                        ))}
                    </View>
                    <View ref={blackPiecesSectionRef} onLayout={onBlackPiecesSection} style={styles.piecesPanel}>
                        {[BoardPiece.DARK_PAWN, BoardPiece.DARK_BISHOP, BoardPiece.DARK_KNIGHT, BoardPiece.DARK_ROOK, BoardPiece.DARK_QUEEN, BoardPiece.DARK_KING].map((piece, i) => (
                            <View key={i} style={styles.pieceWrapper}>
                                <DraggablePiece
                                    type={piece}
                                    fromPalette={true}
                                    boardLayout={{ boardPadding: CHESSBOARD_PADDING, tileSize: layout.board.tileSize }}
                                    rootLayout={layout.right}
                                    onDrop={snapToGrid}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <ActionButton
                        source={Constants.icons.scan}
                        text="Rescan"
                        height={45}
                        iconSize={20}
                        fontSize={Constants.SIZES.xLarge}
                        onPress={onRescan}
                        textColor={Constants.COLORS.text_grey}
                        backColor={Constants.COLORS.white}
                    />
                    <ActionButton
                        source={Constants.icons.box_full}
                        text="Save"
                        height={45}
                        iconSize={20}
                        fontSize={Constants.SIZES.xLarge}
                        onPress={onSave}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({

    page: {
        flex: 1,
        backgroundColor: Constants.COLORS.text_grey,

    },

    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
  
    topPannel: {
      flexDirection: 'row',
      paddingHorizontal: '10%',
      columnGap: '10%',
      zIndex: 2, // to allow hitSlop to extend downwards for the top row icons
      marginBottom: '3%'
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
  
    chessboardSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10%'
    },

    chessboardContainer: {
      backgroundColor: Constants.COLORS.white,
      padding: CHESSBOARD_PADDING,
      borderRadius: 12,
      aspectRatio: 1,
      width: '90%'
    },
  
    chessboard: {
      height: '100%',
      width: '100%',
      borderRadius: 5,
      objectFit: 'contain'
    },

    piecesSection: {
      justifyContent: 'space-around',
      columnGap: 10,
    },

    pieceWrapper: {
        minWidth: 50,
        width: '14%', // Fixed size to prevent huge pieces
        maxWidth: 80,
        alignItems: 'center',
        aspectRatio: 1,
        justifyContent: 'center',
    },

    piecesPanel: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginVertical: 5,
    },
  
    actionButtons: {
        marginTop: 'auto', // move to bottom
        flexDirection: 'row',
        justifyContent: 'space-around',
        columnGap: '10%'
    }
});

export default BoardStateEdit;