import { formatCurrency, formatDate } from "@/lib/format";
import type { ProposalDocument } from "@/lib/proposal-document";

const BRAND_NAME = "Proposta.ai";

function companyName(document: ProposalDocument): string {
  return document.settings.companyName?.trim() || BRAND_NAME;
}

function dateLabel(value: string | null | undefined): string {
  return value ? formatDate(value) : "—";
}

function amountLabel(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : formatCurrency(value);
}

function Header({ document }: { document: ProposalDocument }) {
  const logo = document.settings.logo;
  const tagline = document.settings.tagline?.trim();

  return (
    <header className="doc-header">
      <div className="doc-brand">
        {logo ? (
          <img src={logo} alt={companyName(document)} className="doc-logo-img" />
        ) : (
          <div className="doc-logo">P</div>
        )}
        <div>
          <div className="doc-brand-name">{companyName(document)}</div>
          {tagline && <div className="doc-brand-tag">{tagline}</div>}
        </div>
      </div>
      <div className="doc-header-meta">
        {document.code ? (
          <>
            Proposta <strong>{document.code}</strong>
          </>
        ) : (
          <>
            Emissão <strong>{dateLabel(document.issuedAt)}</strong>
          </>
        )}
      </div>
    </header>
  );
}

function contactLine(document: ProposalDocument): string {
  return [document.settings.cnpj, document.settings.phone, document.settings.email]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}

function Footer({
  document,
  pageNumber,
  totalPages,
}: {
  document: ProposalDocument;
  pageNumber: number;
  totalPages: number;
}) {
  const contact = contactLine(document);

  return (
    <footer className="doc-footer">
      <span>
        {companyName(document)} — Documento gerado eletronicamente
        {contact && <span className="doc-footer-contact"> · {contact}</span>}
      </span>
      <span className="doc-page-number">
        Página {pageNumber} de {totalPages}
      </span>
    </footer>
  );
}

function EventSummary({ document }: { document: ProposalDocument }) {
  return (
    <section className="doc-section">
      <div className="doc-grid doc-grid-3">
        <div>
          <div className="doc-field-label">Data do evento</div>
          <div className="doc-field-value">{dateLabel(document.eventDate)}</div>
        </div>
        <div>
          <div className="doc-field-label">Local</div>
          <div className="doc-field-value">{document.location || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">Público estimado</div>
          <div className="doc-field-value">{document.audience || "—"}</div>
        </div>
      </div>
    </section>
  );
}

function ClientBlock({ document }: { document: ProposalDocument }) {
  const client = document.client;
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">Contratante</h2>
      <div className="doc-grid doc-grid-2">
        <div>
          <div className="doc-field-label">Nome / Razão social</div>
          <div className="doc-field-value">{client?.name || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">CNPJ / CPF</div>
          <div className="doc-field-value">{client?.document || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">Endereço</div>
          <div className="doc-field-value">{client?.address || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">Código do cliente</div>
          <div className="doc-field-value">{client?.clientCode || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">Contato</div>
          <div className="doc-field-value">{client?.contact || "—"}</div>
        </div>
        <div>
          <div className="doc-field-label">Data de emissão</div>
          <div className="doc-field-value">{dateLabel(document.issuedAt)}</div>
        </div>
      </div>
    </section>
  );
}

function ModulesList({ document }: { document: ProposalDocument }) {
  if (document.modules.length === 0) {
    return <p className="doc-empty">Nenhum recurso selecionado.</p>;
  }
  return (
    <ul className="doc-list">
      {document.modules.map((module, index) => (
        <li key={`${module.title}-${index}`}>
          <span className="doc-check">✓</span>
          <span>
            <span className="doc-item-title">{module.title}</span>
            {module.description && (
              <>
                <br />
                <span className="doc-item-desc">{module.description}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function EquipmentList({ document }: { document: ProposalDocument }) {
  if (document.equipment.length === 0) {
    return <p className="doc-empty">Nenhum equipamento informado.</p>;
  }
  return (
    <div>
      {document.equipment.map((item, index) => (
        <div className="doc-equip-row" key={`${item.name}-${index}`}>
          <div className="doc-equip-qty">{String(item.quantity).padStart(2, "0")}</div>
          <div>
            <div className="doc-item-title">{item.name}</div>
            {item.description && <div className="doc-item-desc">{item.description}</div>}
            {item.specs && <div className="doc-equip-specs">{item.specs}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleList({ document }: { document: ProposalDocument }) {
  if (document.schedule.length === 0) {
    return null;
  }
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">Cronograma Operacional</h2>
      <div>
        {document.schedule.map((item, index) => (
          <div className="doc-schedule-row" key={`${item.date}-${index}`}>
            <div className="doc-schedule-date">{item.date}</div>
            <div>
              <div className="doc-item-title">{item.title}</div>
              {item.description && <div className="doc-item-desc">{item.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinancialTable({ document }: { document: ProposalDocument }) {
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">Condições comerciais</h2>
      <table className="doc-table">
        <tbody>
          <tr>
            <td>Descrição do pacote</td>
            <td className="doc-amount">{document.title}</td>
          </tr>
          <tr>
            <td>Forma de pagamento</td>
            <td className="doc-amount">{document.paymentMethod || "—"}</td>
          </tr>
          <tr>
            <td>Validade da proposta</td>
            <td className="doc-amount">{dateLabel(document.validUntil)}</td>
          </tr>
          <tr>
            <td>Custos incluídos</td>
            <td className="doc-amount">{document.includedCosts || "—"}</td>
          </tr>
          <tr className="doc-total">
            <td>Valor total</td>
            <td className="doc-amount">{amountLabel(document.totalAmount)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function PaymentSchedule({ document }: { document: ProposalDocument }) {
  if (document.payments.length === 0) {
    return null;
  }
  return (
    <section className="doc-section">
      <h2 className="doc-section-title">Cronograma de pagamento</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Parcela</th>
            <th>Vencimento</th>
            <th style={{ textAlign: "right" }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {document.payments.map((payment, index) => (
            <tr key={`${payment.dueDate}-${index}`}>
              <td>{index + 1}</td>
              <td>{dateLabel(payment.dueDate)}</td>
              <td className="doc-amount">{formatCurrency(payment.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function ProposalDocumentView({
  document,
  includeFooter = true,
}: {
  document: ProposalDocument;
  includeFooter?: boolean;
}) {
  const totalPages = 3;
  const provider = {
    name: document.settings.responsible?.trim(),
    role: document.settings.responsibleRole?.trim(),
    phone: document.settings.phone?.trim(),
    email: document.settings.email?.trim(),
    cnpj: document.settings.cnpj?.trim(),
  };

  return (
    <div>
      {/* Página 1 — Apresentação e Recursos */}
      <article className="doc-page">
        <Header document={document} />

        <div className="doc-hero">
          <h1>{document.title || "Proposta Comercial"}</h1>
          {document.subtitle && <p className="doc-subtitle">{document.subtitle}</p>}
        </div>

        <EventSummary document={document} />
        <ClientBlock document={document} />

        {document.solution && (
          <section className="doc-section">
            <h2 className="doc-section-title">Solução proposta</h2>
            <p className="doc-text">{document.solution}</p>
          </section>
        )}

        <section className="doc-section">
          <h2 className="doc-section-title">Recursos do sistema de credenciamento</h2>
          <ModulesList document={document} />
        </section>

        {includeFooter && <Footer document={document} pageNumber={1} totalPages={totalPages} />}
      </article>

      {/* Página 2 — Equipamentos e Requisitos */}
      <article className="doc-page">
        <Header document={document} />

        {document.equipment.length > 0 && (
          <section className="doc-section">
            <h2 className="doc-section-title">Autoatendimento e equipamentos</h2>
            <EquipmentList document={document} />
          </section>
        )}

        {document.requirements?.trim() && (
          <section className="doc-section">
            <h2 className="doc-section-title">Requisitos pré-evento</h2>
            <p className="doc-text">{document.requirements}</p>
          </section>
        )}

        <ScheduleList document={document} />

        {document.disclaimer?.trim() && (
          <section className="doc-section">
            <h2 className="doc-section-title">Compromissos e avisos contratuais</h2>
            <div className="doc-note">{document.disclaimer}</div>
          </section>
        )}

        {includeFooter && <Footer document={document} pageNumber={2} totalPages={totalPages} />}
      </article>

      {/* Página 3 — Valores, Aceite e Condições */}
      <article className="doc-page">
        <Header document={document} />

        <FinancialTable document={document} />
        <PaymentSchedule document={document} />

        {document.acceptanceNote && (
          <section className="doc-section">
            <h2 className="doc-section-title">Aceite do contratante</h2>
            <p className="doc-text">{document.acceptanceNote}</p>
          </section>
        )}

        <div className="doc-signature">
          <div className="doc-signature-line">
            <div className="doc-signature-name">{companyName(document)}</div>
            {provider.name && <div className="doc-signature-role">{provider.name}</div>}
            <div className="doc-signature-role">{provider.role || "Contratada"}</div>
            {provider.phone && <div className="doc-signature-role">{provider.phone}</div>}
            {provider.email && <div className="doc-signature-role">{provider.email}</div>}
            {provider.cnpj && <div className="doc-signature-role">{provider.cnpj}</div>}
          </div>
          <div className="doc-signature-line">
            <div className="doc-signature-name">{document.client?.name || "Contratante"}</div>
            <div className="doc-signature-role">Contratante — Data: ____/____/________</div>
          </div>
        </div>

        {includeFooter && <Footer document={document} pageNumber={3} totalPages={totalPages} />}
      </article>
    </div>
  );
}
