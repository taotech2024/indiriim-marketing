import React from 'react';
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLogout,
  IconBell,
  IconSettings,
  IconUsers,
  IconPencil,
  IconTrash,
  IconCheck,
  IconSend,
  IconMoon,
  IconSun,
  IconBold,
  IconItalic,
  IconUnderline,
  IconListNumbers,
  IconMessageCircle,
  IconLayoutDashboard,
  IconLayout,
  IconSpeakerphone,
  IconChartBar,
  IconAlertTriangle,
  IconRobot,
  IconArrowRight,
  IconGitBranch,
  IconAlertCircle,
  IconPlus,
  IconInfoCircle,
  IconClock,
  IconShoppingBag,
  IconPhoto,
  IconTrendingUp
} from '@tabler/icons-react';

interface TablerIconProps {
  name: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: React.CSSProperties;
}

const TablerIcon: React.FC<TablerIconProps> = ({ name, size = 'md', color, style }) => {
  const sizeMap = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32
  };
  const iconSize = typeof size === 'number' ? size : sizeMap[size];

  const map: Record<string, React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>> = {
    Email: IconMail,
    Lock: IconLock,
    Visibility: IconEye,
    VisibilityOff: IconEyeOff,
    Logout: IconLogout,
    Bell: IconBell,
    Settings: IconSettings,
    Users: IconUsers,
    Edit: IconPencil,
    Trash: IconTrash,
    Check: IconCheck,
    Send: IconSend,
    Moon: IconMoon,
    Sun: IconSun,
    bold: IconBold,
    italic: IconItalic,
    underline: IconUnderline,
    'list-numbers': IconListNumbers,
    'message-circle': IconMessageCircle,
    mail: IconMail,
    'bell': IconBell,
    'settings': IconSettings,
    Dashboard: IconLayoutDashboard,
    Templates: IconLayout,
    Speakerphone: IconSpeakerphone,
    ChartBar: IconChartBar,
    AlertTriangle: IconAlertTriangle,
    Robot: IconRobot,
    ArrowRight: IconArrowRight,
    GitBranch: IconGitBranch,
    AlertCircle: IconAlertCircle,
    Plus: IconPlus,
    InfoCircle: IconInfoCircle,
    Clock: IconClock,
    ShoppingBag: IconShoppingBag,
    Photo: IconPhoto,
    TrendingUp: IconTrendingUp
  };

  const IconComponent = map[name];
  if (!IconComponent) return null;
  return <IconComponent size={iconSize} color={color} style={style} />;
};

export default TablerIcon;

