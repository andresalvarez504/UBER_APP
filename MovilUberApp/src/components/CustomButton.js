import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomButton = ({
  title, onPress, loading = false, variant = 'primary',
  disabled = false, icon = null, iconSize = 20,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000' : '#FFC61A'} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Icon
              name={icon}
              size={iconSize}
              color={variant === 'primary' ? '#000' : '#FFC61A'}
              style={styles.icon}
            />
          )}
          <Text style={[styles.text, variant !== 'primary' && styles.textOutline]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginVertical: 6,
  },
  primary: { backgroundColor: '#FFC61A' },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  danger: { backgroundColor: '#FF444422', borderWidth: 1.5, borderColor: '#FF444444' },
  disabled: { opacity: 0.45 },
  content: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 8 },
  text: { fontSize: 15, fontWeight: '700', color: '#000' },
  textOutline: { color: '#FFF' },
});

export default CustomButton;