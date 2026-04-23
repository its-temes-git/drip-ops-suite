import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/owner/StatCard";
import { MOCK_TRANSACTIONS } from "@/data/inventory";

const weekRev = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => ({ d, r: [4200,3800,5100,4900,6800,8200,5600][i] }));
const catData = [
  { name: "Shoes", value: 38, fill: "hsl(81 100% 67%)" },
  { name: "Tops", value: 30, fill: "hsl(40 22% 92%)" },
  { name: "Bottoms", value: 22, fill: "hsl(38 95% 55%)" },
  { name: "Accessories", value: 10, fill: "hsl(0 0% 40%)" },
];
const monthTrend = Array.from({ length: 30 }, (_, i) => ({ d: `${i+1}`, v: 2000 + Math.round(Math.random() * 6000) }));

const Analytics = () => (
  <div className="space-y-6 sm:space-y-8">
    <header className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="font-display text-3xl sm:text-5xl tracking-wide">SALES ANALYTICS</h1>
        <p className="text-[10px] sm:text-xs tracking-widest text-muted-foreground">PERFORMANCE OVERVIEW</p>
      </div>
      <input type="text" placeholder="Last 30 days" className="border border-border bg-card px-4 py-2 text-xs tracking-widest" />
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="TOTAL REVENUE" value="ETB 142K" delay={0} />
      <StatCard label="ITEMS SOLD" value="287" delay={0.05} />
      <StatCard label="AVG SALE" value="ETB 4.9K" delay={0.1} />
      <StatCard label="BEST DAY" value="SAT" sub={<span className="text-muted-foreground">ETB 8,200</span>} delay={0.15} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="border border-border bg-card p-6">
        <h2 className="font-display text-2xl mb-4">REVENUE BY DAY</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weekRev}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
            <XAxis dataKey="d" stroke="hsl(0 0% 55%)" fontSize={10} />
            <YAxis stroke="hsl(0 0% 55%)" fontSize={10} />
            <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
            <Bar dataKey="r" fill="hsl(81 100% 67%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-border bg-card p-6">
        <h2 className="font-display text-2xl mb-4">SALES BY CATEGORY</h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={catData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
              {catData.map((c, i) => <Cell key={i} fill={c.fill} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2 text-[10px] tracking-widest">
          {catData.map((c) => (
            <span key={c.name} className="flex items-center gap-2">
              <span className="h-2 w-2" style={{ background: c.fill }} />
              {c.name.toUpperCase()} {c.value}%
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="border border-border bg-card p-6">
      <h2 className="font-display text-2xl mb-4">DAILY TREND — THIS MONTH</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={monthTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 15%)" vertical={false} />
          <XAxis dataKey="d" stroke="hsl(0 0% 55%)" fontSize={10} />
          <YAxis stroke="hsl(0 0% 55%)" fontSize={10} />
          <Tooltip contentStyle={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 15%)", fontSize: 11 }} />
          <Line type="monotone" dataKey="v" stroke="hsl(81 100% 67%)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="border border-border bg-card p-6">
      <h2 className="font-display text-2xl mb-4">RECENT TRANSACTIONS</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[10px] tracking-widest text-muted-foreground">
              <th className="p-2 text-left">TIME</th>
              <th className="p-2 text-left">ITEM</th>
              <th className="p-2 text-left">BRAND</th>
              <th className="p-2 text-left">SIZE</th>
              <th className="p-2 text-left">COLOR</th>
              <th className="p-2 text-left">PRICE</th>
              <th className="p-2 text-left">STAFF</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TRANSACTIONS.map((t, i) => (
              <tr key={i} className="border-b border-border/50">
                <td className="p-2 text-muted-foreground text-xs">{t.time}</td>
                <td className="p-2">{t.item}</td>
                <td className="p-2 text-[10px] tracking-widest text-primary">{t.brand.toUpperCase()}</td>
                <td className="p-2">{t.size}</td>
                <td className="p-2 text-xs">{t.color}</td>
                <td className="p-2 font-display text-lg">ETB {t.price.toLocaleString()}</td>
                <td className="p-2 text-xs">{t.staff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Analytics;
