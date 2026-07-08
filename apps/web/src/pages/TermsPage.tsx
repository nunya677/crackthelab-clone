export function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl p-6 text-sm leading-relaxed text-zinc-400">
      <h1 className="mb-6 text-2xl font-extrabold text-white">Terms of Service</h1>

      <p className="mb-4 text-xs text-zinc-500">Last updated {new Date().toLocaleDateString()}.</p>

      <h2 className="mt-6 mb-2 font-bold text-white">1. The content is ours</h2>
      <p>
        All challenge descriptions, flags, lesson write-ups, source code, graphics, and other
        content on ExploitYard ("the Platform") are the copyrighted property of ExploitYard and
        its creator, except where otherwise noted. You may not copy, scrape, reproduce,
        redistribute, publicly host a derivative of, or create a competing product substantially
        based on this content or codebase without our prior written permission.
      </p>

      <h2 className="mt-6 mb-2 font-bold text-white">2. No automated scraping</h2>
      <p>
        You may not use bots, crawlers, scrapers, or other automated means to access, index, or
        bulk-download the Platform's challenges, lessons, or other content beyond normal
        interactive use of your own account. We may rate-limit, throttle, or terminate accounts
        that violate this.
      </p>

      <h2 className="mt-6 mb-2 font-bold text-white">3. Accounts and fair use</h2>
      <p>
        Free accounts are limited to the challenge set and instance concurrency shown on the
        pricing page. PRO accounts unlock additional content per the plan you're subscribed to.
        Sharing an account, reselling access, or circumventing plan limits is not permitted.
      </p>

      <h2 className="mt-6 mb-2 font-bold text-white">4. Live sandboxes</h2>
      <p>
        Live challenge instances are isolated, time-limited environments provided for educational
        use only. You agree not to use them to attack, scan, or access any system outside the
        provided sandbox.
      </p>

      <h2 className="mt-6 mb-2 font-bold text-white">5. No warranty</h2>
      <p>
        The Platform is provided "as is," without warranty of any kind. We're not liable for any
        damages arising from your use of it.
      </p>

      <h2 className="mt-6 mb-2 font-bold text-white">6. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the Platform after a change
        constitutes acceptance of the updated terms.
      </p>

      <p className="mt-8 text-xs text-zinc-600">
        This is a general terms template and not a substitute for advice from a lawyer before
        relying on it commercially.
      </p>
    </div>
  );
}
