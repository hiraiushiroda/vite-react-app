export default function DenomTable({ rows }) {
  return (
    <div className="card denom-card">
      <h2 className="denom-title">金種内訳</h2>
      <table className="denom-table">
        <thead>
          <tr>
            <th>金種</th>
            <th>枚数</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.denom}>
              <td>{row.denom.toLocaleString()}</td>
              <td>{row.count.toLocaleString()}</td>
              <td>{row.subtotal.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
