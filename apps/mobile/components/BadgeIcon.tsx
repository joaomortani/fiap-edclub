import React from 'react';
import type { ComponentProps } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type BadgeIconProps = {
  name: string;
  size?: number;
  color?: string;
};

const ICON_MAP: Record<string, IconName> = {
  'Assíduo': 'trophy',
  Equipe: 'shield',
  'Fair Play': 'star',
};

const DEFAULT_ICON: IconName = 'medal';

const BadgeIcon: React.FC<BadgeIconProps> = ({ name, size = 22, color = '#f59e0b' }) => {
  const iconName = ICON_MAP[name] ?? DEFAULT_ICON;

  return (
    <MaterialCommunityIcons
      accessibilityLabel={name}
      name={iconName}
      size={size}
      color={color}
    />
  );
};

export default BadgeIcon;
