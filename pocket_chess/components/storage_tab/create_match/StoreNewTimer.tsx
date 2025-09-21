import React, { useState, useRef, useCallback} from 'react';
import { View, Text, ScrollView, StyleSheet, PanResponder, TextStyle, Image, TextInput, Animated, ViewStyle, PanResponderGestureState, GestureResponderEvent} from 'react-native'
import * as Styles from '../../../styles/index.js';

import * as Constants from '../../../constants/index';
import storage from '../../../classes/Storage';
import Preset, { Time } from '../../../classes/timers_base/Preset';
import ActionButton from '../../common/ActionButton';
import Header from '../../common/Header.jsx';
import ActionIcon from '../../common/ActionIcon';
import HorizontalMultiChoice, { ChoiceOption } from '../../common/HorizontalMultiChoice';
import BoardState, {BoardPiece, PlacedPiece, SideToMove} from '../../../classes/BoardState';
import PresetDetails from './PresetDetails';
import { FischerIncrementStage, FischerIncrementTimer } from '../../../classes/timers_clock_types/FischerIncrement';
import Collapsible from '../../common/Collapsible';
import BoardStateDisplay from '../../common/BoardStateDisplay';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Storage from '../../../classes/Storage';
import * as BoardStateEdit from './BoardStateEdit';

interface StoreNewTimerProps {
  preset?: Preset | null;
  boardScan?: BoardState | null;
}

const StoreNewTimer = ({preset=null, boardScan=null}: StoreNewTimerProps) => {

  //state
  const [title, setTitle] = useState('');
  const playerChoiceRef = useRef(null);
  const [gameCreationDate] = useState<Date>(new Date());
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>(
    boardScan?.toPlacedPieces() || []
  );

  //refs
  const scrollRef = useRef<ScrollView>(null); // scroll view ref for auto scrolling when expanding details in dropdowns

  useFocusEffect(
    useCallback(() => {
      // load updated pieces from temp storage whenever this screen is focused
      const updatedPieces = Storage.getTempData<PlacedPiece[]>(BoardStateEdit.TEMP_STORAGE_KEY);
      if (updatedPieces) {
        setPlacedPieces(updatedPieces);
        // clear temp data after loading to avoid stale data
        Storage.removeTempData(BoardStateEdit.TEMP_STORAGE_KEY);
      }
    }, []) // run every time this screen becomes focused
  );

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
    
    //TODO: Implement storage saving logic
    console.log("Pressed save TODO storage")
  };

  // bookmark the game
  const onPressBookmark = () => {
    console.log("Bookmark pressed");
  };

  const onPressBoard = () => {
    Storage.setTempData<PlacedPiece[]>('store_new_timer_placed_pieces', placedPieces); // save current pieces to temporary storage to retrieve in BoardStateEdit
    router.push('/storage/edit_board_state')
  }

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
      />
      <ScrollView 
          ref={scrollRef}
          contentContainerStyle={{flexGrow: 1, width: '100%', alignItems: 'center'}} 
          style={{width: '100%'}}
          stickyHeaderIndices={[2]} // make tabs sticky
        >
        <View style={styles.prebodyContent}>
          <BoardStateDisplay
            placedPieces={placedPieces}
            onPress={onPressBoard}
            style={{ marginTop: 30 }}
          />
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
          hideHeaderWhenExpanded={true}
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

  bodyContent: {
    flex: 1,
    width: '100%',
    backgroundColor: Constants.COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -35, // negative margin to pull it up behind the chessboard!
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