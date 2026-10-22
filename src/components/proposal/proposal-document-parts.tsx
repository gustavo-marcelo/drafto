import { formatCurrency, formatDate } from "@/lib/format";
import type { ProposalDocument, ProposalDocumentItem } from "@/lib/proposal-document";

const BRAND_NAME = "Proposta.ai";

export function companyName(document: ProposalDocument): string {
  return document.settings.companyName?.trim() || BRAND_NAME;
}

function dateLabel(value: string | null | undefined): string {
  return value ? formatDate(value) : "—";
}

function contactLine(document: ProposalDocument): string {
  return [document.settings.cnpj, document.settings.phone, document.settings.email]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" · ");
}

export function DocumentHeader({ document }: { document: ProposalDocument }) {
  const logo = document.settings.logo;
  const tagline = document.settings.tagline?.trim();

  return (
    <header className="doc-header">
      <div className="doc-brand">
        {logo ? (
          // O documento é renderizado como HTML estático (preview e PDF via Puppeteer),
          // onde o otimizador de imagens do Next não está disponível.
          // eslint-disable-next-line @next/next/no-img-element
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

export function DocumentFooter({
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
    <footer className="doc-footer" data-doc-footer>
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

function ItemList({ items, kind }: { items: ProposalDocumentItem[]; kind: string }) {
  return (
    <ul className="doc-list">
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} data-doc-item={kind}>
          <span>
            <span className="doc-item-title">{item.title}</span>
            {item.description && (
              <>
                <br />
                <span className="doc-item-desc">{item.description}</span>
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CatalogSection({
  title,
  items,
  block,
}: {
  title: string;
  items: ProposalDocumentItem[];
  block: "resources" | "infrastructure";
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="doc-section" data-doc-block={block} data-doc-block-count={items.length}>
      <h2 className="doc-section-title">{title}</h2>
      <ItemList items={items} kind={block} />
    </section>
  );
}

export function ScheduleList({ items }: { items: ProposalDocument["schedule"] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="doc-section" data-doc-block="schedule" data-doc-block-count={items.length}>
      <h2 className="doc-section-title">Cronograma Operacional</h2>
      <div>
        {items.map((item, index) => (
          <div className="doc-schedule-row" key={`${item.date}-${index}`} data-doc-item="schedule">
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

function ValueItemsTable({ document }: { document: ProposalDocument }) {
  if (document.valueItems.length === 0) {
    return null;
  }

  const total = document.valueItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <section className="doc-section">
      <h2 className="doc-section-title">Composição do valor</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th style={{ textAlign: "right" }}>Qtd.</th>
            <th style={{ textAlign: "right" }}>Valor unitário</th>
            <th style={{ textAlign: "right" }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {document.valueItems.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td>{item.description}</td>
              <td className="doc-amount">{item.quantity}</td>
              <td className="doc-amount">{formatCurrency(item.unitValue)}</td>
              <td className="doc-amount">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
          <tr className="doc-total">
            <td>Investimento</td>
            <td />
            <td />
            <td className="doc-amount">{formatCurrency(total)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

function FinancialTable({ document }: { document: ProposalDocument }) {
  // Com composição de valor o total já aparece como "Investimento"; sem ela, o
  // valor total da proposta precisa ser exibido para o cliente.
  const showTotal = document.valueItems.length === 0 && document.totalAmount != null;

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
          {showTotal ? (
            <tr className="doc-total">
              <td>Valor total</td>
              <td className="doc-amount">{formatCurrency(document.totalAmount ?? 0)}</td>
            </tr>
          ) : null}
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

export function IntroBlock({
  document,
  titleHeadingLevel: TitleTag = "h1",
}: {
  document: ProposalDocument;
  titleHeadingLevel?: "h1" | "h2";
}) {
  return (
    <div className="doc-block" data-doc-block="intro">
      <div className="doc-hero">
        <TitleTag className="doc-title">{document.title || "Proposta Comercial"}</TitleTag>
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
    </div>
  );
}

export function RequirementsBlock({ document }: { document: ProposalDocument }) {
  if (!document.requirements?.trim()) {
    return null;
  }

  return (
    <section className="doc-section" data-doc-block="requirements">
      <h2 className="doc-section-title">Requisitos pré-evento</h2>
      <p className="doc-text">{document.requirements}</p>
    </section>
  );
}

export function DisclaimerBlock({ document }: { document: ProposalDocument }) {
  if (!document.disclaimer?.trim()) {
    return null;
  }

  return (
    <section className="doc-section" data-doc-block="disclaimer">
      <h2 className="doc-section-title">Compromissos e avisos contratuais</h2>
      <div className="doc-note">{document.disclaimer}</div>
    </section>
  );
}

export function ValuesBlock({ document }: { document: ProposalDocument }) {
  const provider = {
    name: document.settings.responsible?.trim(),
    role: document.settings.responsibleRole?.trim(),
    phone: document.settings.phone?.trim(),
    email: document.settings.email?.trim(),
    cnpj: document.settings.cnpj?.trim(),
  };

  return (
    <div className="doc-block" data-doc-block="values">
      <FinancialTable document={document} />
      <ValueItemsTable document={document} />
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
    </div>
  );
}
