import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

const CustomButton = ({ title, onPress, loading = false, variant = 'primary', disabled = false }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}>
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? '#000' : '#FFC61A'} />
        : <Text style={[styles.text, variant === 'outline' && styles.textOutline]}>{title}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  primary: {
    backgroundColor: '#FFC61A',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFC61A',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  textOutline: {
    color: '#FFC61A',
  },
});

export default CustomButton;