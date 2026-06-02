import { PollForm } from '../features/polls/components/PollForm';

export default function HomePage() {
  return (
    <main className="shell">
      <p className="eyebrow">Interview challenge</p>
      <h1>Build a live poll in minutes.</h1>
      <p>
        Create a poll with 2 to 5 options, share a unique voting link, and watch the results update live.
      </p>
      <PollForm />
    </main>
  );
}
