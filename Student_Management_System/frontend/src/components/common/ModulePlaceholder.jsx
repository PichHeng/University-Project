import { Button } from "@/components/ui/button";

function ModulePlaceholder({
    role,
    title,
    description,
    actions = [],
    items = [],
}) {
    return (
        <>
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--sms-gold)]">
                        {role}
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-[var(--sms-ink)]">
                        {title}
                    </h1>

                    <p className="mt-2 max-w-2xl text-[var(--sms-muted)]">
                        {description}
                    </p>
                </div>

                {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                            <Button
                                key={action}
                                className="sms-btn-primary"
                                disabled
                                title="This feature is coming soon"
                            >
                                {action}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <section className="sms-card overflow-hidden">
                <div className="sms-section-header px-5 py-4">
                    <h2 className="font-semibold text-[var(--sms-ink)]">
                        Module Preview
                    </h2>
                </div>

                <div className="p-5">
                    {items.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-3">
                            {items.map((item) => (
                                <div
                                    key={item.title}
                                    className="sms-card-soft p-4"
                                >
                                    <p className="font-semibold text-[var(--sms-ink)]">
                                        {item.title}
                                    </p>
                                    <p className="mt-2 text-sm text-[var(--sms-muted)]">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-sm font-medium text-[var(--sms-muted)]">
                                This module UI will be implemented in the next steps.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default ModulePlaceholder;
