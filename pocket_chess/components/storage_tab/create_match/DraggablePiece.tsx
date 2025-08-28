import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, StyleSheet, ViewStyle, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import IconComponent from '../../common/IconComponent';
import * as Constants from '../../../constants/index';

export interface BoardLayoutRefShape {
  board: ContainerLayout;
  left: ContainerLayout;
  right: ContainerLayout;
}

export interface ContainerLayout {
  x: number;
  y: number;
  size: number;
  tileSize: number;
}

interface Tile {
  row: number;
  col: number;
}

interface DraggablePieceProps {
  id?: string;           // undefined if from palette
  type: string;
  tile?: Tile;           // defined only if currently on board
  fromPalette?: boolean;     // true if side panel source
  containerKey: 'left' | 'board' | 'right';
  rootLayoutRef: React.MutableRefObject<BoardLayoutRefShape>;
  boardPadding: number;
  onDrop: (event: GestureResponderEvent, gestureState: PanResponderGestureState, type: string, fromPalette: boolean, id?: string) => void;
}

const DraggablePiece: React.FC<DraggablePieceProps> = ({ id, type, tile, fromPalette = false, containerKey, rootLayoutRef, boardPadding, onDrop}) => {

    const pan = useRef(new Animated.ValueXY()).current;
    const [dragging, setDragging] = useState(false);

    const startDrag = (e: GestureResponderEvent, gesture: PanResponderGestureState) => {
        // while root offset is not known dont allow dragging
        console.log("startDrag")

        // re-read tileSize each time (may have been 0 earlier)
        const { tileSize, x, y } = rootLayoutRef.current?.[containerKey] || {};
        if (!tileSize) return;

        // offset so ghost centers under finger
        pan.setOffset({
            x: gesture.x0 - x - tileSize / 2,
            y: gesture.y0 - y - tileSize / 2
        });

        // base zero so dx/dy map cleanly
        pan.setValue({ x: 0, y: 0 });

        setDragging(true);
    };

    const finishDrag = (e: GestureResponderEvent, g: PanResponderGestureState) => {
        console.log("Dropped piece:", { type, id, fromPalette });
        pan.extractOffset();         // merge offset into value
        setDragging(false);
        onDrop(e, g, type, fromPalette, id);
    };

    const panResponder = useRef(
        PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: startDrag,
        onPanResponderMove: Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
        ),
        onPanResponderRelease: finishDrag,
        onPanResponderTerminate: finishDrag
        })
    ).current;

    const { tileSize } = rootLayoutRef.current?.[containerKey] || {};

    // palette default style (keeps original layout space)
    const fromPaletteStyle: ViewStyle | null =
        fromPalette ? { 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '75%', 
            aspectRatio: 1 
        } : { 
            alignItems: 'center', 
            justifyContent: 'center' 
        };

    // static (non-dragging) render position when on board
    const staticStyle: ViewStyle | null =
        (tile && tileSize) ? {
            position: 'absolute' as const,
            left: boardPadding + tile.col * tileSize,
            top: boardPadding + tile.row * tileSize,
            width: tileSize,
            height: tileSize,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            zIndex: 1,
            }
        : fromPaletteStyle;

    return (
        <>
            <View
                style={[staticStyle, dragging && { opacity: 0 }]}
                {...panResponder.panHandlers}
            >
                <IconComponent source={Constants.icons[type as keyof typeof Constants.icons]} />
            </View>

            {dragging && tileSize > 0 && (
                <Animated.View
                pointerEvents="none"
                    // Absolute relative to the SAME root container (page)
                style={[
                    styles.dragLayer,
                    {
                    width: tileSize,
                    height: tileSize,
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y }
                    ]
                    }
                ]}
                >
                <IconComponent source={Constants.icons[type as keyof typeof Constants.icons]} />
                </Animated.View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
  dragLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
});

export default DraggablePiece;