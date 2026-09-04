import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Search,
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Yeh line update ki hai
import * as XLSX from "xlsx";

const MonthlyReports = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/reports/monthly?month=${month}&year=${year}`,
      );
      setReportData(data);
    } catch (error) {
      toast.error("Failed to fetch report data");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // PDF Export Logic (Updated for Vite)
  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    const monthName = new Date(0, month - 1).toLocaleString("default", {
      month: "long",
    });

    doc.setFontSize(18);
    doc.text("WASTE Management System", 14, 22);
    doc.setFontSize(12);
    doc.text(`Monthly Business Report: ${monthName} ${year}`, 14, 30);

    const tableData = [
      ["Total Routes", reportData.masterData.totalRoutes],
      ["Total Vehicles", reportData.masterData.totalVehicles],
      ["Total Shops", reportData.masterData.totalShops],
      ["Total Shop Weight (KG)", reportData.report.totalShopKg],
      ["Total Factory Weight (KG)", reportData.report.totalFactoryKg],
      ["Total Difference (KG)", reportData.report.totalDifference],
      [
        "Total Payable Amount (Rs.)",
        reportData.report.totalPayableAmount.toLocaleString(),
      ],
    ];

    // Naya function use kiya hai yahan
    autoTable(doc, {
      startY: 40,
      head: [["Metric", "Value"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 163, 74] }, // Green-600
    });

    doc.save(`Monthly_Report_${monthName}_${year}.pdf`);
    toast.success("PDF Exported Successfully!");
  };

  // Excel Export Logic
  const exportExcel = () => {
    if (!reportData) return;
    const monthName = new Date(0, month - 1).toLocaleString("default", {
      month: "long",
    });

    const excelData = [
      { Metric: "Total Routes", Value: reportData.masterData.totalRoutes },
      { Metric: "Total Vehicles", Value: reportData.masterData.totalVehicles },
      { Metric: "Total Shops", Value: reportData.masterData.totalShops },
      {
        Metric: "Total Shop Weight (KG)",
        Value: reportData.report.totalShopKg,
      },
      {
        Metric: "Total Factory Weight (KG)",
        Value: reportData.report.totalFactoryKg,
      },
      {
        Metric: "Total Difference (KG)",
        Value: reportData.report.totalDifference,
      },
      {
        Metric: "Total Payable Amount (Rs.)",
        Value: reportData.report.totalPayableAmount,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");
    XLSX.writeFile(workbook, `Monthly_Report_${monthName}_${year}.xlsx`);
    toast.success("Excel Exported Successfully!");
  };

  // Print Logic
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
        <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Monthly Business Report
          </h1>
          <p className="text-sm text-gray-500">
            Generate, view, and export overall business summaries
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 print:hidden">
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} /> Month
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", {
                  month: "short",
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Year
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Search size={18} /> {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:m-0 print:border-none print:shadow-none">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Monthly Business Report
              </h2>
              <p className="text-gray-500">
                For{" "}
                {new Date(0, month - 1).toLocaleString("default", {
                  month: "long",
                })}{" "}
                {year}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Printer size={16} /> Print
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} /> PDF
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors"
              >
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Infrastructure Overview
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Routes</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalRoutes}
                  </span>
                </li>
                <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Vehicles</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalVehicles}
                  </span>
                </li>
                <li className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Shops</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalShops}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Collection & Financials
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">
                    Total Shop Weight
                  </span>
                  <span className="font-bold text-blue-900">
                    {reportData.report.totalShopKg} KG
                  </span>
                </li>
                <li className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="text-teal-800 font-medium">
                    Total Factory Weight
                  </span>
                  <span className="font-bold text-teal-900">
                    {reportData.report.totalFactoryKg} KG
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 rounded-lg ${reportData.report.totalDifference >= 0 ? "bg-green-50" : "bg-red-50"}`}
                >
                  <span
                    className={`font-medium ${reportData.report.totalDifference >= 0 ? "text-green-800" : "text-red-800"}`}
                  >
                    Total Difference
                  </span>
                  <span
                    className={`font-bold ${reportData.report.totalDifference >= 0 ? "text-green-900" : "text-red-900"}`}
                  >
                    {reportData.report.totalDifference > 0 ? "+" : ""}
                    {reportData.report.totalDifference} KG
                  </span>
                </li>
                <li className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-purple-800 font-bold">
                    Total Payable Amount
                  </span>
                  <span className="font-bold text-purple-900 text-lg">
                    Rs. {reportData.report.totalPayableAmount.toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReports;
