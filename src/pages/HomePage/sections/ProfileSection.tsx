import { motion } from 'framer-motion';
import { MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IProfile } from '@/types/profile';

interface ProfileSectionProps {
  profile: IProfile;
}

export default function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="flex flex-col items-center text-center">
        {/* 头像 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Avatar className="size-20 md:size-24 ring-4 ring-background shadow-md">
            <AvatarImage src={profile.avatar} alt={profile.nick} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {profile.nick.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* 昵称 */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-xl md:text-2xl font-bold text-foreground"
        >
          {profile.nick}
        </motion.h1>

        {/* 简介 */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed"
        >
          {profile.bio}
        </motion.p>

        {/* 装饰分割线 */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 w-16 h-0.5 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
        />
      </div>
    </motion.section>
  );
}
