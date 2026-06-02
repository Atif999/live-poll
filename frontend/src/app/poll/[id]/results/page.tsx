import { getPollResults } from '@/src/features/polls/api/pollsApi';
import { ResultsChart } from '@/src/features/polls/components/ResultsChart';
import { notFound } from 'next/navigation';

export default async function ResultsPage({ params }: { params: { id: string } }) {
  try {
    const results = await getPollResults(params.id);
    return (
      <main className="shell">
        <ResultsChart initialResults={results} />
      </main>
    );
  } catch {
    notFound();
  }
}
