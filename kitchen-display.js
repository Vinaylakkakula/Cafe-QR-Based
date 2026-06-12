// Kitchen Display System (KDS) View Component

const KitchenDisplay = ({ tables, onUpdateTable, settings, showToast }) => {
  // Find all active tickets (occupied tables with items in active split)
  const tickets = tables
    .filter(t => t.status === "occupied" && t.splits && t.splits[t.activeSplit] && t.splits[t.activeSplit].items.length > 0)
    .map(t => {
      const split = t.splits[t.activeSplit];
      return {
        tableId: t.id,
        tableNum: t.num,
        waiter: t.waiter,
        splitIdx: t.activeSplit,
        split: split,
        items: split.items,
        stage: split.courseStage || "new",
      };
    });

  const updateStage = (ticket, newStage) => {
    const table = tables.find(tbl => tbl.id === ticket.tableId);
    if (!table) return;

    const updatedSplits = [...table.splits];
    updatedSplits[ticket.splitIdx] = {
      ...updatedSplits[ticket.splitIdx],
      courseStage: newStage
    };

    onUpdateTable({
      ...table,
      splits: updatedSplits
    });

    showToast(`✓ Table T${ticket.tableNum} status updated to: ${newStage.toUpperCase()}`);
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="section-head">
        <div>
          <div className="section-title">Kitchen Display System (KDS)</div>
          <div className="section-sub">{tickets.length} active tickets in preparation</div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          background: 'var(--bg-1)',
          borderRadius: 12,
          border: '1px dashed var(--line)',
          marginTop: 20
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>👨‍🍳</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>No orders in the kitchen</div>
          <p style={{ fontSize: 12, marginTop: 4 }}>New orders sent to tables will appear here in real-time.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          marginTop: 18
        }}>
          {tickets.map(ticket => {
            const isReady = ticket.stage === "ready";
            const isPreparing = ticket.stage === "preparing";
            const isServed = ticket.stage === "served";

            return (
              <div
                key={ticket.tableId}
                style={{
                  background: 'var(--bg-1)',
                  border: `1px solid ${isReady ? 'var(--green)' : isPreparing ? 'var(--amber)' : 'var(--line)'}`,
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-md)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '12px 16px',
                  background: isReady ? 'rgba(107, 191, 123, 0.12)' : isPreparing ? 'rgba(242, 164, 58, 0.12)' : 'var(--bg-2)',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Table T{ticket.tableNum}
                      <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-dim)' }}>
                        ({ticket.split.label})
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Waiter: {ticket.waiter || "—"}
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`course-chip ${
                    isReady ? 'course-ready' : isPreparing ? 'course-preparing' : isServed ? 'course-served' : 'course-new'
                  }`}>
                    {ticket.stage}
                  </span>
                </div>

                {/* Items List */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ticket.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700,
                        background: 'var(--bg-3)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--amber-bright)'
                      }}>
                        {item.qty}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {item.name}
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: item.veg ? 'var(--green)' : 'var(--red)',
                            display: 'inline-block'
                          }} />
                        </div>
                        {item.note && (
                          <div style={{ fontSize: 11, color: 'var(--amber)', fontStyle: 'italic', marginTop: 2 }}>
                            » {item.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions Footer */}
                <div style={{
                  padding: '12px 16px',
                  background: 'var(--bg-2)',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  gap: 8
                }}>
                  {ticket.stage === "new" && (
                    <button
                      onClick={() => updateStage(ticket, "preparing")}
                      style={{
                        flex: 1, background: 'var(--amber-soft)', border: '1px solid var(--amber)',
                        color: 'var(--amber-bright)', borderRadius: 8, padding: '8px 12px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      🔥 Start Preparing
                    </button>
                  )}
                  {ticket.stage === "preparing" && (
                    <button
                      onClick={() => updateStage(ticket, "ready")}
                      style={{
                        flex: 1, background: 'rgba(107, 191, 123, 0.12)', border: '1px solid var(--green)',
                        color: 'var(--green)', borderRadius: 8, padding: '8px 12px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      🔔 Mark Ready
                    </button>
                  )}
                  {ticket.stage === "ready" && (
                    <button
                      onClick={() => updateStage(ticket, "served")}
                      style={{
                        flex: 1, background: 'rgba(103, 162, 217, 0.12)', border: '1px solid var(--blue)',
                        color: 'var(--blue)', borderRadius: 8, padding: '8px 12px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      🍽 Mark Served
                    </button>
                  )}
                  {ticket.stage === "served" && (
                    <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '6px 0' }}>
                      Served & Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { KitchenDisplay });
