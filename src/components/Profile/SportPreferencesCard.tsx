const getSkillStars = (level: string): number => {
	switch (level) {
		case 'beginner': return 1;
		case 'intermediate': return 2;
		case 'advanced': return 3;
		case 'professional': return 4;
		default: return 1;
	}
};

const renderStars = (count: number, color: string) => {
	return (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			{[...Array(4)].map((_, i) => (
				<Ionicons
					key={i}
					name={i < count ? 'star' : 'star-outline'}
					size={18}
					color={color}
					style={{ marginRight: 2 }}
				/>
			))}
		</View>
	);
};
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserSportPreference {
	sportId: string;
	sportName: string;
	skillLevel: string;
}

interface SportPreferencesCardProps {
	sportPreferences: UserSportPreference[];
	themeColors: {
		cardBackground: string;
		text: string;
		textSecondary: string;
		accent: string;
	};
}

const getSkillLevelText = (level: string): string => {
	switch (level) {
		case 'beginner': return 'Başlangıç';
		case 'intermediate': return 'Orta';
		case 'advanced': return 'İleri';
		case 'professional': return 'Profesyonel';
		default: return 'Başlangıç';
	}
};

// Spor adına göre uygun emoji döndüren fonksiyon
const getSportEmoji = (sportName: string): React.ReactNode => {
  const map: { [key: string]: React.ReactNode } = {
    'Futbol': <Text style={{ fontSize: 26 }}>⚽</Text>,
    'Basketbol': <Text style={{ fontSize: 26 }}>🏀</Text>,
    'Tenis': <Text style={{ fontSize: 26 }}>🎾</Text>,
    'Voleybol': <Text style={{ fontSize: 26 }}>🏐</Text>,
    'Atletizm': <Text style={{ fontSize: 26 }}>🏃</Text>,
    'Yoga': <Text style={{ fontSize: 26 }}>🧘</Text>,
    'Yüzme': <Text style={{ fontSize: 26 }}>🏊</Text>,
    'Koşu': <Text style={{ fontSize: 26 }}>🏃</Text>,
    'Golf': <Text style={{ fontSize: 26 }}>⛳</Text>,
    'Bisiklet': <Text style={{ fontSize: 26 }}>🚴</Text>,
    'Hentbol': <Text style={{ fontSize: 26 }}>🤾</Text>,
    'Masa Tenisi': <Text style={{ fontSize: 26 }}>🏓</Text>,
    // Diğer sporlar için ekleme yapılabilir
  };
  return map[sportName] || <Text style={{ fontSize: 26 }}>❓</Text>;
};

export const SportPreferencesCard: React.FC<SportPreferencesCardProps> = ({ sportPreferences, themeColors }) => {
	const [expanded, setExpanded] = useState(false);

	const shownPreferences = expanded ? sportPreferences : sportPreferences.slice(0, 1);

		return (
			<View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}> 
				<View style={styles.headerRow}>
					<Text style={[styles.title, { color: themeColors.text }]}>Spor Tercihlerim</Text>
				</View>
				{shownPreferences.length === 0 ? (
					<Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>Henüz spor tercihi eklenmemiş.</Text>
				) : (
					shownPreferences.map((item) => (
						<View key={item.sportId} style={styles.sportItem}>
							<View style={styles.sportIconContainer}>
								{getSportEmoji(item.sportName)}
							</View>
							<View style={styles.sportInfo}>
								<Text style={[styles.sportName, { color: themeColors.text }]}>{item.sportName}</Text>
								<Text style={[styles.skillLevel, { color: themeColors.textSecondary }]}>{getSkillLevelText(item.skillLevel)}</Text>
								{renderStars(getSkillStars(item.skillLevel), themeColors.accent)}
							</View>
						</View>
					))
				)}
				{sportPreferences.length > 1 && (
					<TouchableOpacity style={styles.showMoreBtn} onPress={() => setExpanded(!expanded)}>
						<Text style={[styles.showMoreText, { color: themeColors.accent }]}>Daha fazlasını gör {expanded ? <Ionicons name="chevron-up" size={18} color={themeColors.accent} /> : <Ionicons name="chevron-down" size={18} color={themeColors.accent} />}</Text>
					</TouchableOpacity>
				)}
			</View>
		);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		borderRadius: 16,
		marginVertical: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
	emptyText: {
		fontSize: 15,
		textAlign: 'center',
		marginVertical: 20,
	},
	sportItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#EEE',
	},
	sportIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#E8F5E920',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	sportInfo: {
		flex: 1,
	},
	sportName: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 2,
	},
	skillLevel: {
		fontSize: 13,
		color: '#888',
	},
	showMoreBtn: {
		alignSelf: 'center',
		marginTop: 8,
		padding: 8,
		borderRadius: 8,
	},
	showMoreText: {
		fontSize: 15,
		fontWeight: '500',
		flexDirection: 'row',
		alignItems: 'center',
	},
});
