import MatchmakerQuiz from './_components/MatchmakerQuiz';

export const metadata = {
  title: '30-Second AI Software Matchmaker — Find the Right Tool Instantly | SaaTerra',
  description:
    'Take the 30-Second SaaTerra AI Matchmaker Quiz. Get instant, zero-spam, unbiased software recommendations tailored to your exact budget and business requirements.',
};

export default function MatchmakerPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <MatchmakerQuiz />
    </main>
  );
}
