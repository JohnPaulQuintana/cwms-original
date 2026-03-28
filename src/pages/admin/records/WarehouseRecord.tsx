import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFileAlt,
  FaBox,
  FaUser,
  FaMapMarkerAlt,
  FaTruck,
  FaExclamationTriangle,
  FaClock,
  FaDownload,
  FaFilePdf,
} from "react-icons/fa";
import { showToast } from "../../../utils/toast";
import { getWarehouseRecordRequests } from "../../../services/warehouseRecord";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function WarehouseRecord() {
  const { token } = useAuth();
  const location = useLocation();
  const record = location.state?.wh;

  const [warehouseRecords, setWarehouseRecords] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string>("all");

  useEffect(() => {
    if (token && record?.id) loadWarehouseRecords(page);
  }, [token, page]);

  async function loadWarehouseRecords(pageNumber: number) {
    try {
      setLoading(true);
      const response = await getWarehouseRecordRequests(
        token!,
        pageNumber,
        record.id
      );
      const data = response.data;
      setWarehouseRecords(data.data || []);
      setTotalPages(data.last_page || 1);
    } catch (error) {
      showToast((error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Unique projects for filter
  const projects = useMemo(() => {
    const allProjects = warehouseRecords
      .map((r) => r.project?.name)
      .filter(Boolean);
    return ["all", ...Array.from(new Set(allProjects))];
  }, [warehouseRecords]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (projectFilter === "all") return warehouseRecords;
    return warehouseRecords.filter((r) => r.project?.name === projectFilter);
  }, [warehouseRecords, projectFilter]);

  // CSV Export
  const exportCSV = () => {
    if (filteredRecords.length === 0) return;

    const header = [
      "Record ID",
      "Project",
      "Inventory",
      "Requested Qty",
      "Shipment ID",
      "Defect Quantity",
      "Defect Description",
      "Defect Status",
      "Defect Reported At",
    ];

    const rows: any[] = [];
    filteredRecords.forEach((rec) => {
      const defects =
        rec.inventory?.defect_items?.filter(
          (d: any) => d.shipment_id === rec.shipment_item?.shipment_id
        ) || [];

      if (defects.length > 0) {
        defects.forEach((d: any) => {
          rows.push([
            rec.id,
            rec.project?.name || "",
            rec.inventory?.name || "",
            `${rec.requested_qty} ${rec.inventory?.unit || ""}`,
            rec.shipment_item?.shipment_id || "",
            d.quantity,
            d.reason,
            d.status,
            new Date(d.created_at).toLocaleString(),
          ]);
        });
      } else {
        rows.push([
          rec.id,
          rec.project?.name || "",
          rec.inventory?.name || "",
          `${rec.requested_qty} ${rec.inventory?.unit || ""}`,
          rec.shipment_item?.shipment_id || "",
          "",
          "",
          "",
          "",
        ]);
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouse_records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportPDF = () => {
    if (filteredRecords.length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;

    const colors = {
      primary: "#11224E",
      primaryLight: "#1A2B70",
      secondary: "#FBBF24",
      neutralLight: "#F3F4F6",
      neutralDark: "#374151",
      error: "#EF4444",
      approved: "#10B981",
      pending: "#FBBF24",
    };

    // Group records by project
    // Type your grouped records
    const recordsByProject: Record<string, any[]> = filteredRecords.reduce(
      (acc, rec) => {
        const projectName = rec.project?.name || "No Project";
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(rec);
        return acc;
      },
      {} as Record<string, any[]>
    );

    let y = margin;

    // ===== Top Bar =====
    doc.setFillColor(...hexToRgb(colors.primary));
    doc.rect(0, 0, pageWidth, 18, "F");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Warehouse Records Report", pageWidth / 2, 13, {
      align: "center",
    });
    y += 10;

    // ===== Warehouse Details =====
    doc.setFillColor(...hexToRgb(colors.neutralLight));
    doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 3, 3, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(colors.primaryLight));
    doc.text("Warehouse Details", margin + 4, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${record?.name || "-"}`, margin + 4, y + 16);
    doc.text(`Address: ${record?.address || "-"}`, margin + 4, y + 22);
    y += 30;

    // ===== Iterate Projects =====
    for (const [projectName, records] of Object.entries(recordsByProject)) {
      // Project Header
      doc.setFillColor(...hexToRgb(colors.neutralLight));
      doc.roundedRect(margin, y, pageWidth - margin * 2, 16, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(colors.primary));
      doc.text(`Project: ${projectName}`, margin + 4, y + 10);
      y += 23;

      // Records for project
      records.forEach((rec) => {
        if (y > 250) {
          // simple page break
          doc.addPage();
          y = margin;
        }

        // Record Info (compact)
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...hexToRgb(colors.neutralDark));
        doc.text(
          `Record #${rec.id} - ${rec.inventory?.name || "-"}`,
          margin + 2,
          y
        );
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Qty: ${rec.requested_qty} ${
            rec.inventory?.unit || "-"
          } | Shipment: ${rec.shipment_item?.shipment_id || "-"}`,
          margin + 2,
          y + 6
        );
        doc.text(
          `Created: ${new Date(rec.created_at).toLocaleString()}`,
          margin + 2,
          y + 12
        );
        y += 4;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...hexToRgb(colors.primary));
        doc.text(`Shipment Record:`, margin + 2, y + 18);
        y += 22;
        console.log(rec);
        // Defect Table
        const defects =
          rec.inventory?.defect_items?.filter(
            (d: any) => d.shipment_id === rec.shipment_item?.shipment_id
          ) || [];

        const deliveredQty =
          rec.shipment_item?.quantity || rec.requested_qty || 0;

        const defectQty = defects.reduce(
          (sum: number, d: any) => sum + (d.quantity || 0),
          0
        );

        const deliveredDate = rec.shipment_item?.created_at
          ? new Date(rec.shipment_item.created_at).toLocaleString()
          : "-";

        const successQty = deliveredQty - defectQty;

        const tableBody =
          defects.length > 0
            ? [
                ...defects.map((d: any) => [
                  d.quantity,
                  d.reason,
                  d.status,
                  new Date(d.created_at).toLocaleString(),
                ]),
                [
                  successQty,
                  "Delivered successfully",
                  "delivered",
                  deliveredDate,
                ], // success row
              ]
            : [
                [
                  deliveredQty,
                  "Delivered successfully",
                  "delivered",
                  deliveredDate,
                ],
              ];

        autoTable(doc, {
          startY: y,
          head: [["Qty", "Description", "Status", "Reported At"]],
          body: tableBody,
          theme: "grid",
          headStyles: {
            fillColor: [...hexToRgb(colors.primaryLight)],
            textColor: 255,
            fontSize: 10,
          },
          bodyStyles: { fontSize: 9 },
          alternateRowStyles: { fillColor: [...hexToRgb(colors.neutralLight)] },
          styles: { cellPadding: 1 },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 2) {
              const status = data.cell.text[0].toLowerCase();
              if (status === "reject") {
                data.cell.styles.fillColor = hexToRgb(colors.error);
                data.cell.styles.textColor = 255;
              } else if (status === "pending") {
                data.cell.styles.fillColor = hexToRgb(colors.pending);
                data.cell.styles.textColor = 0;
              } else if (status === "approved" || status === "delivered") {
                data.cell.styles.fillColor = hexToRgb(colors.approved);
                data.cell.styles.textColor = 0;
              }
            }
          },
        });

        y = (doc as any).lastAutoTable.finalY + 12;
      });

      y += 2; // spacing between projects
    }

    // ===== Footer Page Numbers =====
    const pageCount = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.getHeight() - 5,
        { align: "right" }
      );
    }

    doc.save("warehouse_records.pdf");
  };

  // Hex to RGB helper
  function hexToRgb(hex: string): [number, number, number] {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  return (
    <div className="bg-white rounded-md shadow p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {record?.name || "Warehouse"} Records
          </h1>
          <p className="text-gray-500">{record?.address}</p>
        </div>

        {/* Filter & Export */}
        <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {projects.map((p) => (
              <option key={p} value={p}>
                {p === "all" ? "All Projects" : p}
              </option>
            ))}
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary-dark"
          >
            <FaDownload /> Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* Records */}
      {loading ? (
        <p className="text-center text-gray-500 p-6">Loading records...</p>
      ) : filteredRecords.length === 0 ? (
        <p className="text-center text-gray-500 p-6">No records found.</p>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredRecords.map((rec) => {
            const defects =
              rec.inventory?.defect_items?.filter(
                (def: any) => def.shipment_id === rec.shipment_item?.shipment_id
              ) || [];

            return (
              <motion.div
                key={rec.id}
                whileHover={{ scale: 1.03 }}
                className="border border-primary rounded-md shadow-md p-5 bg-white transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 border-b-2 pb-2">
                  <div className="">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-primary text-xl" />
                      <h2 className="font-semibold text-primaryLight text-lg">
                        Record #{rec.id}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FaClock />
                      Created: {new Date(rec.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      rec.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : rec.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Left Column */}
                  <div className="sm:w-1/2 flex flex-col gap-2">
                    {/* Inventory */}
                    <div className="flex items-start gap-2">
                      <FaBox className="text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium text-primaryLight">
                          {rec.inventory?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {rec.inventory?.sku} • {rec.requested_qty}{" "}
                          {rec.inventory?.unit}
                        </p>
                      </div>
                    </div>

                    {/* Project */}
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium text-primaryLight">
                          {rec.project?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rec.project?.location}
                        </p>
                      </div>
                    </div>

                    {/* Requester */}
                    <div className="flex items-start gap-2">
                      <FaUser className="text-gray-500 mt-1" />
                      <div>
                        <p className="font-medium text-primaryLight">
                          {rec.requester?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rec.requester?.email}
                        </p>
                      </div>
                    </div>

                    {/* Shipment */}
                    {rec.shipment_item && (
                      <div className="flex items-start gap-2">
                        <FaTruck className="text-gray-500 mt-1" />
                        <div>
                          <p className=" text-primaryLight font-medium">
                            Shipment #{rec.shipment_item.shipment_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {rec.shipment_item.quantity}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="sm:w-1/2 border bg-white p-2">
                    <div className="">
                      <div className="flex items-center gap-2 mb-2">
                        <FaExclamationTriangle className="text-red-500 text-sm" />
                        <span className="text-sm font-medium text-gray-700">
                          Defect Items
                        </span>
                      </div>

                      {defects.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {defects.map((def: any) => (
                            <div
                              key={def.id}
                              className="flex flex-col gap-2 border bg-white rounded-md p-2 transition-colors"
                            >
                              <div className="flex flex-col w-full gap-1">
                                <span className="text-gray-400 text-[10px] uppercase">
                                  Quantity
                                </span>
                                <span className="font-medium text-gray-800">
                                  {def.quantity} pcs
                                </span>
                                <div className="w-full">
                                  <span className="text-gray-400 text-[10px] uppercase block">
                                    Description
                                  </span>
                                  <span
                                    className="text-gray-600"
                                    title={def.reason}
                                  >
                                    {def.reason}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-row w-full justify-between">
                                <div>
                                  <span className="text-gray-400 text-[10px] uppercase block">
                                    Status
                                  </span>
                                  <span
                                    className={`p-1 rounded-md uppercase w-fit text-[10px] font-semibold mt-0.5 ${
                                      def.status === "reject"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {def.status}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400 text-[10px] uppercase block">
                                    Reported At
                                  </span>
                                  <span className="text-gray-500 text-xs">
                                    {new Date(def.created_at).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs ml-2">No defects</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-primary text-white rounded disabled:bg-gray-300 hover:bg-primary-dark"
        >
          Next
        </button>
      </div>
    </div>
  );
}
