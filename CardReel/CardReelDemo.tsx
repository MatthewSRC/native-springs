import {
  FontAwesome,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CardReel } from "./CardReel";

const { width } = Dimensions.get("window");

const CARD_HEIGHT = 80;

const brandData = [
  {
    name: "Netflix",
    amount: 17,
    date: "24 July, 15:25",
    color: "black",
    icon: () => (
      <MaterialCommunityIcons name="netflix" size={28} color="#E50914" />
    ),
  },
  {
    name: "Amazon Prime",
    amount: 5,
    date: "21 July, 9:12",
    color: "#00A8E1",
    icon: () => <FontAwesome name="amazon" size={20} color="white" />,
  },
  {
    name: "Apple",
    amount: 8,
    date: "22 July, 7:12",
    color: "black",
    icon: () => <FontAwesome name="apple" size={24} color="white" />,
  },
  {
    name: "Spotify",
    amount: 7,
    date: "23 July, 9:12",
    color: "#1DB954",
    icon: () => <FontAwesome name="spotify" size={24} color="white" />,
  },
  {
    name: "YouTube Premium",
    amount: 12,
    date: "20 July, 14:30",
    color: "#FF0000",
    icon: () => <FontAwesome name="youtube-play" size={24} color="white" />,
  },
  {
    name: "GitHub Pro",
    amount: 4,
    date: "16 July, 12:00",
    color: "#24292E",
    icon: () => <FontAwesome name="github" size={24} color="white" />,
  },
  {
    name: "Adobe Creative",
    amount: 25,
    date: "19 July, 16:45",
    color: "#FF0000",
    icon: () => <MaterialIcons name="adobe" size={24} color="white" />,
  },
  {
    name: "Microsoft 365",
    amount: 15,
    date: "18 July, 10:20",
    color: "#0078D4",
    icon: () => <FontAwesome name="windows" size={20} color="white" />,
  },
  {
    name: "Dropbox",
    amount: 10,
    date: "17 July, 8:15",
    color: "#0061FF",
    icon: () => <FontAwesome name="dropbox" size={24} color="white" />,
  },
  {
    name: "OpenAI",
    amount: 23,
    date: "25 July, 11:43",
    color: "#412991",
    icon: () => <MaterialCommunityIcons name="robot" size={20} color="white" />,
  },
];

const cards = brandData.map((brand, index) => (
  <Card key={index} index={index} brand={brand} />
));

export default function CardReelDemo() {
  return (
    <SafeAreaView style={styles.container}>
      <CardReel cardHeight={CARD_HEIGHT} cardWidth={width * 0.8}>
        {cards}
      </CardReel>
    </SafeAreaView>
  );
}

function Card({
  index,
  brand,
}: {
  index: number;
  brand: (typeof brandData)[0];
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      100 * index,
      withSpring(1, {
        stiffness: 900,
        damping: 90,
        mass: 8,
      })
    );
  }, [index]);

  const rStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.5, 1]);
    const opacity = progress.value;

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[cardStyles.card, rStyle]}>
      <View style={cardStyles.contentContainer}>
        <View
          style={[cardStyles.iconContainer, { backgroundColor: brand.color }]}
        >
          {brand.icon()}
        </View>
        <View style={cardStyles.textContainer}>
          <Text style={cardStyles.brandName}>{brand.name}</Text>
          <Text style={cardStyles.date}>{brand.date}</Text>
        </View>
      </View>
      <Text style={cardStyles.amount}>-$ {brand.amount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
});

const cardStyles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    width: width * 0.8,
    alignSelf: "center",
    backgroundColor: "white",
    justifyContent: "space-between",
    borderRadius: 12,
    flexDirection: "row",
    paddingHorizontal: 28,
    paddingVertical: 20,
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.27,
    shadowRadius: 6.22,
    elevation: 6,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  iconContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    gap: 4,
  },
  brandName: {
    fontWeight: "500",
    fontSize: 16,
  },
  date: {
    color: "#c4c2c2",
    fontSize: 12,
  },
  amount: {
    fontWeight: "600",
  },
});
