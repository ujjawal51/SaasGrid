import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'My Dashboard & Profile | SaaTerra',
  description: 'Manage your saved SaaS tools, cashback claim status, software submissions, and account settings.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
