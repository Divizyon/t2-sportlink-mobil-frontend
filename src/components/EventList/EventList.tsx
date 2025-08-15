import React from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
  Animated
} from 'react-native';
import { EventCard } from '../EventCard/EventCard';
import { Event } from '../../types/eventTypes/event.types';
import { useThemeStore } from '../../store/appStore/themeStore';
import { Ionicons } from '@expo/vector-icons';

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEventPress?: (event: Event) => void;
  emptyText?: string;
  style?: ViewStyle;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: ViewStyle;
  refreshControl?: React.ReactElement;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  isLoading = false,
  onRefresh,
  onEndReached,
  onEventPress,
  emptyText = 'Etkinlik bulunamadı',
  style,
  ListHeaderComponent,
  contentContainerStyle,
  refreshControl,
}) => {
  const { theme } = useThemeStore();
  
  // Yükleme durumu footer'ı
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color={theme.colors.accent} />
      </View>
    );
  };
  
  // Boş liste durumu
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Animated.View 
          style={[
            styles.emptyIconContainer,
            { backgroundColor: theme.colors.accent + '15' }
          ]}
        >
          <Ionicons 
            name="calendar-outline" 
            size={32} 
            color={theme.colors.accent} 
          />
        </Animated.View>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}> 
          {emptyText}
        </Text>
      </View>
    );
  };

  const handleEventPress = (event: Event) => {
    if (onEventPress) {
      onEventPress(event);
    }
  };

  return (
    <FlatList
      data={events}

      
      renderItem={({ item, index }) => (
        <Animated.View
          style={[
            styles.cardContainer,

          ]}
        >
          <EventCard
            event={item}
            onPress={() => handleEventPress(item)}
          />
        </Animated.View>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.contentContainer,
        events.length === 0 && styles.emptyListContent,
        contentContainerStyle
      ]}
      style={[styles.container, style]}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      ListHeaderComponent={ListHeaderComponent}
      refreshControl={
        refreshControl || (onRefresh ? (
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[theme.colors.accent]}
            tintColor={theme.colors.accent}
          />
        ) : undefined)
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.2}
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      windowSize={10}
      numColumns={2}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Alt gezinme çubuğundan dolayı ekstra boşluk
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cardContainer: {
    width: '50%',
    padding: 8
  }
});