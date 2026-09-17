// AUTO-SYNCED from packages/shared — edit there, then run node scripts/sync-shared.js
// Promoted from vendor/ahmedbna-ui-components (registry/src/components/ui/media-picker.tsx).
// Adaptations: NexG tokens via useTheme, NexGButton trigger, RN Image previews.
// Permission flow kept but moved to expo-image-picker (expo-media-library is outside
// the shared import allowlist), so the custom `gallery` grid falls back to the system
// picker; the `gallery` prop is kept for API compatibility. Selection API unchanged.
import { NexGButton } from "@/components/ui/NexGButton";
import { useTheme } from "@/theme";
import * as ImagePicker from "expo-image-picker";
import { Video, X, type LucideProps } from "lucide-react-native";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  FlatList,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";

export type NexGMediaType = "image" | "video" | "all";
export type NexGMediaQuality = "low" | "medium" | "high";

export interface NexGMediaAsset {
  id: string;
  uri: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
  filename?: string;
  fileSize?: number;
}

export type NexGMediaPickerSize = "default" | "sm" | "lg" | "icon";
export type NexGMediaPickerVariant =
  | "default"
  | "destructive"
  | "success"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export interface NexGMediaPickerProps {
  children?: ReactNode;
  style?: ViewStyle;
  size?: NexGMediaPickerSize;
  variant?: NexGMediaPickerVariant;
  /** Kept for API compatibility; the NexG trigger is label-based (NexGButton). */
  icon?: ComponentType<LucideProps>;
  disabled?: boolean;
  mediaType?: NexGMediaType;
  multiple?: boolean;
  maxSelection?: number;
  quality?: NexGMediaQuality;
  buttonText?: string;
  placeholder?: string;
  /** Kept for API compatibility; currently resolves via the system picker. */
  gallery?: boolean;
  showPreview?: boolean;
  previewSize?: number;
  selectedAssets?: NexGMediaAsset[];
  onSelectionChange?: (assets: NexGMediaAsset[]) => void;
  onError?: (error: string) => void;
}

// Helper function to compare arrays of NexGMediaAssets
const arraysEqual = (a: NexGMediaAsset[], b: NexGMediaAsset[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((item, index) => {
    const bItem = b[index];
    return (
      item.id === bItem.id && item.uri === bItem.uri && item.type === bItem.type
    );
  });
};

const mapTriggerSize = (size: NexGMediaPickerSize): "medium" | "large" =>
  size === "sm" ? "medium" : "large";

const mapTriggerVariant = (
  variant: NexGMediaPickerVariant
): "primary" | "secondary" | "ghost" | "destructive" => {
  if (variant === "destructive") return "destructive";
  if (variant === "secondary" || variant === "outline") return "secondary";
  if (variant === "ghost" || variant === "link") return "ghost";
  return "primary";
};

export const NexGMediaPicker = forwardRef<View, NexGMediaPickerProps>(
  (
    {
      children,
      mediaType = "all",
      multiple = false,
      maxSelection = 10,
      quality = "high",
      onSelectionChange,
      onError,
      buttonText,
      showPreview = true,
      previewSize = 80,
      style,
      variant = "default",
      size = "default",
      disabled = false,
      selectedAssets = [],
    },
    ref
  ) => {
    const { colors } = useTheme();
    const [assets, setAssets] = useState<NexGMediaAsset[]>(selectedAssets);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [canAskAgain, setCanAskAgain] = useState(true);

    // Use ref to track previous selectedAssets to avoid unnecessary updates
    const prevSelectedAssetsRef = useRef<NexGMediaAsset[]>(selectedAssets);

    // Theme colors
    const borderColor = colors.border.strong;
    const accentColor = colors.accent.primary;
    const onAccent = colors.text.inverse;

    // Update internal state when selectedAssets prop changes (with proper comparison)
    useEffect(() => {
      // Only update if the arrays are actually different
      if (!arraysEqual(prevSelectedAssetsRef.current, selectedAssets)) {
        setAssets(selectedAssets);
        prevSelectedAssetsRef.current = selectedAssets;
      }
    }, [selectedAssets]);

    // Requested lazily, from the picker button press, rather than eagerly on
    // mount — avoids surfacing the OS permission prompt before the user has
    // expressed any intent to pick media.
    const requestPermissions = async (): Promise<{
      granted: boolean;
      canAskAgain: boolean;
    }> => {
      try {
        const { status, canAskAgain: canAsk } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        const granted = status === "granted";
        setHasPermission(granted);
        setCanAskAgain(canAsk);

        if (!granted) {
          onError?.(
            canAsk
              ? "Media library permission is required to access photos and videos"
              : "Media library permission was denied. Enable it in Settings to continue."
          );
        }

        return { granted, canAskAgain: canAsk };
      } catch {
        onError?.("Failed to request permissions");
        setHasPermission(false);
        return { granted: false, canAskAgain: true };
      }
    };

    const pickFromGallery = async () => {
      if (!hasPermission) {
        if (hasPermission === false && !canAskAgain) {
          Linking.openSettings();
          return;
        }

        const { granted, canAskAgain: canAsk } = await requestPermissions();
        if (!granted) {
          if (!canAsk) {
            Linking.openSettings();
          }
          return;
        }
      }

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:
            mediaType === "image"
              ? ["images"]
              : mediaType === "video"
                ? ["videos"]
                : ["images", "videos"],
          allowsMultipleSelection: multiple,
          quality: quality === "high" ? 1 : quality === "medium" ? 0.7 : 0.3,
          selectionLimit: multiple ? maxSelection : 1,
        });

        if (!result.canceled && result.assets) {
          const newAssets = result.assets.map((asset, index) => ({
            id: `gallery_${Date.now()}_${index}`,
            uri: asset.uri,
            type:
              asset.type === "video" ? ("video" as const) : ("image" as const),
            width: asset.width,
            height: asset.height,
            duration: asset.duration || undefined,
            filename: asset.fileName || undefined,
            fileSize: asset.fileSize,
          }));

          handleAssetSelection(newAssets);
        }
      } catch {
        onError?.("Failed to pick media from gallery");
      }
    };

    const handleAssetSelection = (newAssets: NexGMediaAsset[]) => {
      let updatedAssets: NexGMediaAsset[];

      if (multiple) {
        updatedAssets = [...assets, ...newAssets].slice(0, maxSelection);
      } else {
        updatedAssets = newAssets;
      }

      setAssets(updatedAssets);
      prevSelectedAssetsRef.current = updatedAssets; // Update ref to prevent loop
      onSelectionChange?.(updatedAssets);
    };

    const removeAsset = (assetId: string) => {
      const filteredAssets = assets.filter((asset) => asset.id !== assetId);
      setAssets(filteredAssets);
      prevSelectedAssetsRef.current = filteredAssets; // Update ref
      onSelectionChange?.(filteredAssets);
    };

    const renderPreviewItem = ({ item }: { item: NexGMediaAsset }) => (
      <View style={[styles.previewItem, { borderColor }]}>
        <Image
          source={{ uri: item.uri }}
          style={[
            styles.previewImage,
            { width: previewSize, height: previewSize },
          ]}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel="Selected media preview"
        />
        {item.type === "video" && (
          <View style={styles.videoIndicator} pointerEvents="none">
            <Video size={16} color="white" />
          </View>
        )}
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: accentColor }]}
          onPress={() => removeAsset(item.id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Remove media"
        >
          <X size={12} color={onAccent} />
        </TouchableOpacity>
      </View>
    );

    const triggerLabel =
      buttonText ||
      `Select ${
        mediaType === "all" ? "Media" : mediaType === "image" ? "Images" : "Videos"
      }`;

    return (
      <View ref={ref} style={style}>
        {children ? (
          children
        ) : (
          <NexGButton
            label={triggerLabel}
            onPress={pickFromGallery}
            disabled={disabled}
            variant={mapTriggerVariant(variant)}
            size={mapTriggerSize(size)}
          />
        )}

        {showPreview && assets.length > 0 && (
          <FlatList
            data={assets}
            renderItem={renderPreviewItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.previewContainer}
            contentContainerStyle={styles.previewContent}
          />
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  previewContainer: {
    marginTop: 12,
  },

  previewContent: {
    paddingHorizontal: 4,
    paddingEnd: 20,
  },

  previewItem: {
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },

  previewImage: {
    borderRadius: 8,
  },

  videoIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 4,
  },

  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

NexGMediaPicker.displayName = "NexGMediaPicker";
