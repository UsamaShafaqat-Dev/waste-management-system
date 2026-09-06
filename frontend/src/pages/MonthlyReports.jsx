import React, { useState, useEffect, useContext } from "react";
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
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { LanguageContext } from "../context/LanguageContext"; // Translation Hook

const MonthlyReports = () => {
  const { t, language } = useContext(LanguageContext);

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
      [t("Total Routes"), reportData.masterData.totalRoutes],
      [t("Total Vehicles"), reportData.masterData.totalVehicles],
      [t("Total Shops"), reportData.masterData.totalShops],
      [t("Total Shop Weight (KG)"), reportData.report.totalShopKg],
      [t("Total Factory Weight (KG)"), reportData.report.totalFactoryKg],
      [t("Total Difference (KG)"), reportData.report.totalDifference],
      [
        t("Total Payable Amount (Rs.)"),
        reportData.report.totalPayableAmount.toLocaleString(),
      ],
    ];

    autoTable(doc, {
      startY: 40,
      head: [[t("Metric"), t("Value")]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [22, 163, 74] },
    });

    doc.save(`Monthly_Report_${monthName}_${year}.pdf`);
    toast.success("PDF Exported Successfully!");
  };

  const exportExcel = () => {
    if (!reportData) return;
    const monthName = new Date(0, month - 1).toLocaleString("default", {
      month: "long",
    });

    const excelData = [
      {
        [t("Metric")]: t("Total Routes"),
        [t("Value")]: reportData.masterData.totalRoutes,
      },
      {
        [t("Metric")]: t("Total Vehicles"),
        [t("Value")]: reportData.masterData.totalVehicles,
      },
      {
        [t("Metric")]: t("Total Shops"),
        [t("Value")]: reportData.masterData.totalShops,
      },
      {
        [t("Metric")]: t("Total Shop Weight (KG)"),
        [t("Value")]: reportData.report.totalShopKg,
      },
      {
        [t("Metric")]: t("Total Factory Weight (KG)"),
        [t("Value")]: reportData.report.totalFactoryKg,
      },
      {
        [t("Metric")]: t("Total Difference (KG)"),
        [t("Value")]: reportData.report.totalDifference,
      },
      {
        [t("Metric")]: t("Total Payable Amount (Rs.)"),
        [t("Value")]: reportData.report.totalPayableAmount,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");
    XLSX.writeFile(workbook, `Monthly_Report_${monthName}_${year}.xlsx`);
    toast.success("Excel Exported Successfully!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`space-y-6 ${language === "ur" ? "text-right" : "text-left"}`}
    >
      <div
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {t("Monthly Business Report")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("Generate, view, and export overall business summaries")}
          </p>
        </div>
      </div>

      <div
        className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 print:hidden ${language === "ur" ? "flex-row-reverse" : ""}`}
      >
        <div className="w-40">
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <Calendar size={16} /> {t("Month")}
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500 bg-white ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString(
                  language === "ur" ? "ur-PK" : "en-US",
                  {
                    month: "short",
                  },
                )}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label
            className={`block text-sm font-medium text-gray-700 mb-2 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            {t("Year")}
          </label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-rose-500 ${language === "ur" ? "text-right" : "text-left"}`}
          />
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className={`flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
        >
          <Search size={18} />{" "}
          {loading ? t("Generating...") : t("Generate Report")}
        </button>
      </div>

      {reportData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:m-0 print:border-none print:shadow-none">
          <div
            className={`flex justify-between items-center mb-6 border-b pb-4 ${language === "ur" ? "flex-row-reverse" : ""}`}
          >
            <div>
              <h2
                className={`text-2xl font-bold text-gray-800 ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("Monthly Business Report")}
              </h2>
              <p
                className={`text-gray-500 mt-1 ${language === "ur" ? "text-right" : "text-left"}`}
              >
                {t("For ")}
                {new Date(0, month - 1).toLocaleString(
                  language === "ur" ? "ur-PK" : "en-US",
                  {
                    month: "long",
                  },
                )}{" "}
                {year}
              </p>
            </div>
            <div
              className={`flex gap-2 print:hidden ${language === "ur" ? "flex-row-reverse" : ""}`}
            >
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <Printer size={16} /> {t("Print")}
              </button>
              <button
                onClick={exportPDF}
                className={`flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-sm font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <Download size={16} /> {t("PDF")}
              </button>
              <button
                onClick={exportExcel}
                className={`flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg text-sm font-medium transition-colors ${language === "ur" ? "flex-row-reverse" : ""}`}
              >
                <FileSpreadsheet size={16} /> {t("Excel")}
              </button>
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${language === "ur" ? "text-right" : "text-left"}`}
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("Infrastructure Overview")}
              </h3>
              <ul className="space-y-4">
                <li
                  className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-gray-600">{t("Total Routes")}</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalRoutes}
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-gray-600">{t("Total Vehicles")}</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalVehicles}
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 bg-gray-50 rounded-lg ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-gray-600">{t("Total Shops")}</span>
                  <span className="font-bold text-gray-900">
                    {reportData.masterData.totalShops}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {t("Collection & Financials")}
              </h3>
              <ul className="space-y-4">
                <li
                  className={`flex justify-between items-center p-3 bg-blue-50 rounded-lg ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-blue-800 font-medium">
                    {t("Total Shop Weight")}
                  </span>
                  <span className="font-bold text-blue-900">
                    {reportData.report.totalShopKg} KG
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 bg-teal-50 rounded-lg ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-teal-800 font-medium">
                    {t("Total Factory Weight")}
                  </span>
                  <span className="font-bold text-teal-900">
                    {reportData.report.totalFactoryKg} KG
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 rounded-lg ${reportData.report.totalDifference >= 0 ? "bg-green-50" : "bg-red-50"} ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className={`font-medium ${reportData.report.totalDifference >= 0 ? "text-green-800" : "text-red-800"}`}
                  >
                    {t("Total Difference")}
                  </span>
                  <span
                    className={`font-bold ${reportData.report.totalDifference >= 0 ? "text-green-900" : "text-red-900"}`}
                  >
                    {reportData.report.totalDifference > 0 ? "+" : ""}
                    {reportData.report.totalDifference} KG
                  </span>
                </li>
                <li
                  className={`flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100 ${language === "ur" ? "flex-row-reverse" : ""}`}
                >
                  <span className="text-purple-800 font-bold">
                    {t("Total Payable Amount")}
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
