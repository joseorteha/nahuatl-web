declare module 'boring-avatars' {
  import { ComponentType } from 'react';

  interface AvatarProps {
    size?: number;
    name: string;
    variant?: 'marble' | 'beam' | 'pixel' | 'sunset' | 'ring' | 'bauhaus';
    colors?: string[];
  }

  const Avatar: ComponentType<AvatarProps>;
  export default Avatar;
}
