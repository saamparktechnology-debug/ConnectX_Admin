import maleAvatar from '../assets/images/avatar_male.png';
import femaleAvatar from '../assets/images/avatar_female.png';

export const getAvatarSource = (user) => {
  if (user?.primary_photo) return { uri: user.primary_photo };
  return user?.gender === 'female' ? femaleAvatar : maleAvatar;
};
