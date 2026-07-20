export function Newsletter() {
  return (
    <section className="newsletter" id="newsletter">
      <div className="newsletter__monogram" aria-hidden="true">
        IMC
      </div>
      <div className="newsletter__content">
        <span className="eyebrow">Correspondance privée</span>
        <h2>Recevoir les prochains récits.</h2>
        <p>
          Une lettre éditoriale consacrée aux nouveaux articles, portraits et invitations.
        </p>
        <form className="newsletter__form" action="/newsletter" method="get">
          <label className="sr-only" htmlFor="newsletter-email">
            Adresse e-mail
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            placeholder="Votre adresse e-mail"
            autoComplete="email"
            required
          />
          <button type="submit">S’inscrire</button>
        </form>
        <small>Le formulaire sera connecté lors de la prochaine phase.</small>
      </div>
    </section>
  );
}
