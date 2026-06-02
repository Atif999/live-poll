import { getPoll } from '@/src/features/polls/api/pollsApi';
import { VoteCard } from '@/src/features/polls/components/VoteCard';
import { notFound } from 'next/navigation';

export default async function VotePage({ params }: { params: { id: string } }) {
  try {
    const poll = await getPoll(params.id);
    return (
      <main className="shell">
        <VoteCard poll={poll} />
      </main>
    );
  } catch {
    notFound();
  }
}
