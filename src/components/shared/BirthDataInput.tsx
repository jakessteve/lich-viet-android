import React from 'react';
import { UnifiedBirthDataPicker, type UnifiedBirthData } from './UnifiedBirthDataPicker';

export type BirthDataInputValue = UnifiedBirthData;

export interface BirthDataInputProps {
  value: {
    birthDate: Date;
    birthHour: number;
    birthMinute: number;
    latitude: number;
    longitude: number;
    timezone: number;
    name?: string;
    gender?: 'nam' | 'nu' | 'male' | 'female';
    locationName?: string;
    countryCode?: string;
    countryName?: string;
  };
  onChange: (value: BirthDataInputProps['value']) => void;
  showName?: boolean;
  showGender?: boolean;
  showLunarToggle?: boolean;
  showLocation?: boolean;
  showProfilePrefill?: boolean;
  className?: string;
}

export const BirthDataInput: React.FC<BirthDataInputProps> = ({
  value,
  onChange,
  showName = false,
  showGender = false,
  showLunarToggle = true,
  showLocation = true,
  showProfilePrefill = true,
  className,
}) => {
  return (
    <UnifiedBirthDataPicker
      value={value}
      onChange={onChange}
      showName={showName}
      showGender={showGender}
      showLunarToggle={showLunarToggle}
      showLocation={showLocation}
      showProfilePrefill={showProfilePrefill}
      className={className}
    />
  );
};

export default BirthDataInput;
