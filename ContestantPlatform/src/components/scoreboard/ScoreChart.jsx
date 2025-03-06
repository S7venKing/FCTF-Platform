import React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { name: 'Jan', sales: 30 },
  { name: 'Feb', sales: 20 },
  { name: 'Mar', sales: 27 },
  { name: 'Apr', sales: 50 },
  { name: 'May', sales: 40 },
];

const MyLineChart = () => {
  return (
    <LineChart width={500} height={300} data={data}>
      <Line type="monotone" dataKey="sales" stroke="#8884d8" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </LineChart>
  );
};

export default MyLineChart;
