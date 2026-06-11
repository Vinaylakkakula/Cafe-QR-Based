// Menu grid with images

const MenuGrid = ({ items, categories, activeCat, onCat, onAdd, canAdd, currency, onToggleAvail }) => {
  const filtered = items.filter(i => i.cat === activeCat);
  const counts = {};
  categories.forEach(c => { counts[c.id] = items.filter(i => i.cat === c.id && i.available).length; });
  return (
    <div className="menu-area">
      <div className="section-head">
        <div>
          <div className="section-title">Menu</div>
          <div className="section-sub">
            {canAdd ? "Tap an item to add · Right-click to toggle availability" : "Select a table to start an order"}
          </div>
        </div>
      </div>
      <div className="cat-tabs">
        {categories.map(c => (
          <button key={c.id} className={`cat-tab ${activeCat === c.id ? "active" : ""}`} onClick={() => onCat(c.id)}>
            <span style={{marginRight:6}}>{c.icon}</span>{c.name}<span className="count">{counts[c.id]}</span>
          </button>
        ))}
      </div>
      <div className="menu-grid">
        {filtered.map(item => (
          <button
            key={item.id}
            className={`menu-card ${!item.available ? "unavailable" : ""}`}
            disabled={!item.available || !canAdd}
            onClick={() => onAdd(item)}
            onContextMenu={(e) => { e.preventDefault(); onToggleAvail && onToggleAvail(item); }}
          >
            <div className="menu-img">
              {item.img && <img src={item.img} alt={item.name} loading="lazy" onError={(e)=>{e.target.style.display='none';}}/>}
              <div className={`veg-badge ${item.veg ? "" : "nonveg"}`}/>
              {!item.available && <span className="unavailable-tag">86'd</span>}
              {item.available && item.stock <= 8 && <span className="stock-low">Low stock · {item.stock}</span>}
            </div>
            <div className="menu-card-body">
              <div className="menu-name">{item.name}</div>
              <div className="menu-desc">{item.desc}</div>
              <div className="menu-bottom">
                <div className="menu-price">{currency}{item.price.toFixed(2)}</div>
                <div className="menu-add">{!item.available ? "Unavailable" : canAdd ? "＋ Add" : "—"}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

Object.assign(window, { MenuGrid });
