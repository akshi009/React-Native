import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8E8E8', dark: '#1E1E1E' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#6B7280"
          name="sparkles"
          style={styles.headerImage}
        />
      }>

      {/* Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Hey Akshi ✨
        </ThemedText>
      </ThemedView>

      {/* Intro Card */}
      <ThemedView style={styles.card}>
        <ThemedText style={styles.role}>
          UI/UX Designer • Frontend Developer
        </ThemedText>

        <ThemedText style={styles.description}>
          Designing experiences, building interfaces, and slowly turning ideas
          into beautiful digital products.
        </ThemedText>
      </ThemedView>

      {/* Quote */}
      <ThemedView style={styles.quoteBox}>
        <ThemedText style={styles.quote}>
          “Small progress every day becomes something huge.”
        </ThemedText>
      </ThemedView>

      {/* Current Focus */}
      <Collapsible title="🚀 Currently Building">
        <ThemedText>
          • React Native apps
        </ThemedText>

        <ThemedText>
          • AI-powered frontend experiences
        </ThemedText>

        <ThemedText>
          • Interactive UI animations
        </ThemedText>

        <ThemedText>
          • Full-stack projects with modern design systems
        </ThemedText>
      </Collapsible>

      {/* Skills */}
      <Collapsible title="🎨 Skills & Tools">
        <ThemedText>
          Figma • React • React Native • Next.js • TypeScript • MUI • Appwrite
        </ThemedText>
      </Collapsible>

      {/* Inspiration */}
      <Collapsible title="💡 Design Philosophy">
        <ThemedText>
          I love minimal interfaces with emotional design, smooth interactions,
          and clean modern layouts that feel intuitive.
        </ThemedText>
      </Collapsible>

      {/* Image Section */}
      <Collapsible title="🖼 Favorite Tech">
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.reactLogo}
        />

        <ExternalLink href="https://reactnative.dev/">
          <ThemedText type="link">Explore React Native</ThemedText>
        </ExternalLink>
      </Collapsible>

      {/* Platform */}
      {Platform.select({
        ios: (
          <View style={{ marginTop: 10 }}>
            <ThemedText>
              This app also supports beautiful parallax scrolling on iOS ✨
            </ThemedText>
          </View>
        ),
      })}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -60,
    right: -20,
    position: 'absolute',
    opacity: 0.4,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  card: {
    padding: 18,
    borderRadius: 24,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  role: {
    fontSize: 18,
    fontFamily: Fonts.rounded,
    marginBottom: 8,
  },

  description: {
    opacity: 0.8,
    lineHeight: 22,
    fontSize: 15,
  },

  quoteBox: {
    marginBottom: 20,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },

  quote: {
    fontStyle: 'italic',
    opacity: 0.8,
  },

  reactLogo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginVertical: 10,
  },
});