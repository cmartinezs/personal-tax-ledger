import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function IncomesSection({ sources, taxYear, prevYears, busy, formatAmount, formatFrequencyLabel, sourceAnnual, sourceHint, onEdit, onRemove, onCopyFromPrevious }) {
    const monthlyTotal = sources.filter(source => source.frequency === 'MONTHLY').reduce((acc, source) => acc + (Number(source.amount) || 0), 0);
    const annualTotal = sources.reduce((acc, source) => acc + sourceAnnual(source), 0);
    return _jsxs(_Fragment, { children: [_jsxs("section", { className: "metrics", children: [_jsxs("article", { className: "metric", children: [_jsx("small", { children: "Fuentes activas" }), _jsx("strong", { children: String(sources.length) }), _jsx("span", { className: "metric-hint", children: `Cantidad de fuentes de ingreso guardadas para el año comercial ${taxYear}.` })] }), _jsxs("article", { className: "metric", children: [_jsx("small", { children: "Total mensual recurrente" }), _jsx("strong", { children: formatAmount(monthlyTotal) }), _jsx("span", { className: "metric-hint", children: "Suma de los montos mensuales de las fuentes con frecuencia mensual." })] }), _jsxs("article", { className: "metric", children: [_jsx("small", { children: "Proyecci\u00F3n anual estimada" }), _jsx("strong", { children: formatAmount(annualTotal) }), _jsx("span", { className: "metric-hint", children: "Monto mensual \u00D7 meses (mensuales) m\u00E1s montos anuales o de una sola vez. Es nominal: los sueldos ingresados como l\u00EDquidos se convierten a bruto en el motor." })] })] }), _jsx("div", { className: "source-list", children: sources.length === 0
                    ? _jsxs("div", { className: "empty", children: [`Todavía no hay ingresos guardados para ${taxYear}.`, prevYears.length > 0 && _jsxs(_Fragment, { children: [_jsxs("button", { className: "primary", onClick: onCopyFromPrevious, disabled: busy, children: ["Copiar desde ", prevYears[0]] }), _jsxs("small", { children: ["Reutiliza los ingresos del a\u00F1o ", prevYears[0], " como punto de partida. Cada a\u00F1o conserva sus propios ingresos."] })] })] })
                    : sources.map(source => _jsxs("article", { className: "source-card", children: [_jsxs("div", { children: [_jsx("span", { className: "kind", children: source.kind }), _jsx("h3", { children: source.name }), _jsxs("p", { children: [formatAmount(source.amount), " \u00B7 ", source.frequency === 'MONTHLY' ? `${source.months} meses` : formatFrequencyLabel(source.frequency)] }), _jsx("span", { className: "metric-hint", children: sourceHint(source) })] }), _jsxs("div", { className: "source-actions", children: [_jsx("button", { onClick: () => onEdit(source), children: "Editar" }), _jsx("button", { className: "danger-text", onClick: () => onRemove(source.id), children: "Eliminar" })] })] }, source.id)) })] });
}
export function SummaryMetrics({ metrics, onExplain }) {
    return _jsx("section", { className: "metrics", children: metrics.map(metric => _jsxs("article", { className: `metric ${metric.tone || ''}`, children: [_jsx("small", { children: metric.label }), _jsx("strong", { children: metric.value }), metric.hint && _jsx("span", { className: "metric-hint", children: metric.hint }), onExplain && _jsx("button", { className: "metric-explain", onClick: () => onExplain(metric.key), children: "Ver c\u00E1lculo" })] }, metric.label)) });
}
export function Panel({ title, children, tone }) {
    return _jsxs("section", { className: `shared-panel shared-panel-${tone || 'default'}`, children: [_jsx("h2", { children: title }), children] });
}
export function EmptyState({ title, actionLabel, onAction }) {
    return _jsxs("div", { className: "shared-empty", children: [_jsx("p", { children: title }), actionLabel && onAction && _jsx("button", { onClick: onAction, children: actionLabel })] });
}
export function StatusBadge({ label, tone = 'neutral' }) {
    return _jsx("span", { className: `shared-status shared-status-${tone}`, children: label });
}
export function FeeReceiptsTable({ rows, formatAmount, onSelect }) {
    return _jsxs("table", { className: "shared-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Fecha" }), _jsx("th", { children: "Cliente" }), _jsx("th", { children: "Bruto" }), _jsx("th", { children: "Estado" })] }) }), _jsx("tbody", { children: rows.map(row => _jsxs("tr", { onClick: () => onSelect?.(row.id), children: [_jsx("td", { children: row.issueDate }), _jsx("td", { children: row.clientName }), _jsx("td", { children: formatAmount(row.grossAmount) }), _jsx("td", { children: _jsx(StatusBadge, { label: `${row.status} · ${row.paymentStatus}` }) })] }, row.id)) })] });
}
export function MortgageSummary({ loans, formatAmount }) {
    return _jsxs(Panel, { title: "Resumen hipotecario", children: [_jsxs("div", { className: "metrics", children: [_jsxs("article", { className: "metric", children: [_jsx("small", { children: "Cr\u00E9ditos" }), _jsx("strong", { children: loans.length })] }), _jsxs("article", { className: "metric", children: [_jsx("small", { children: "Intereses" }), _jsx("strong", { children: formatAmount(loans.reduce((total, loan) => total + loan.annualInterestPaid, 0)) })] })] }), _jsx("ul", { children: loans.map(loan => _jsxs("li", { children: [loan.propertyAlias, " \u00B7 ", loan.institutionName] }, loan.id)) })] });
}
export function ScenarioTable({ scenarios, formatAmount }) {
    return _jsxs("table", { className: "shared-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Escenario" }), _jsx("th", { children: "Resultado" })] }) }), _jsx("tbody", { children: scenarios.map(scenario => _jsxs("tr", { children: [_jsx("td", { children: scenario.label }), _jsx("td", { children: formatAmount(scenario.balance) })] }, scenario.key)) })] });
}
export function SettingsForm({ fields, onChange, onSave }) {
    return _jsxs("form", { onSubmit: event => { event.preventDefault(); onSave(); }, children: [fields.map(field => _jsxs("label", { children: [_jsx("span", { children: field.label }), _jsx("input", { value: field.value, onChange: event => onChange(field.key, event.target.value) })] }, field.key)), _jsx("button", { type: "submit", children: "Guardar" })] });
}
