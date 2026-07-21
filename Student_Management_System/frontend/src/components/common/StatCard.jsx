function StatCard({ label, value }) {
    return (
        <article className="sms-card p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-3xl font-bold text-[var(--sms-ink)]">{value}</p>
            <h2 className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--sms-muted)]">
                {label}
            </h2>
        </article>
    );
}

export default StatCard;
