'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(1, { message: 'Password is required' }),
});

type Values = zod.infer<typeof schema>;

interface LoginResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
}

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values): Promise<void> => {
    setIsPending(true);
    setErrorMessage(null); // Clear previous error messages

    try {
      const response = await fetch('/api/digi-card/Admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data: LoginResponse = await response.json() as LoginResponse;

      if (!response.ok) {
        // Display error message from API response
        setErrorMessage(data.error || 'Login failed');
        setIsPending(false);
        return;
      }

      // Successful login, store user data in localStorage
      console.log('Login successful:', data.user);
      if (data.user) {
        localStorage.setItem('user-data', JSON.stringify(data.user));
      }

      // Navigate to a dashboard or home page
      router.push('/dashboard'); // Use an explicit path here
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred during login');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email" />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Password</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={() => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <div>
            <Link component={RouterLink} href="/reset-password" variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
