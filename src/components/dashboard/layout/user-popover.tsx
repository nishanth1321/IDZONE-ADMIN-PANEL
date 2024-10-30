import * as React from 'react';
import { useRouter } from 'next/navigation';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();

      if (error) {
        logger.error('Sign out error', error);
        return;
      }

      // Remove user data from localStorage
      localStorage.removeItem('user-data');

      // Refresh the auth state
      await checkSession?.();

      // Redirect to the sign-in page
      router.replace(paths.auth.signIn);
    } catch (err) {
      logger.error('Sign out error', err);
      console.log(err);
    }
  }, [checkSession, router]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
    </Popover>
  );
}
