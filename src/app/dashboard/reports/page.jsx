"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("hydrant");
  
  // Hydrant Summary Form State
  const [hydrantData, setHydrantData] = useState({
    date: "",
    startingLevel: "",
    distributions: [
      { name: "SHIFT A", gallons: "", cashSale: "", creditSale: "" },
      { name: "SHIFT B", gallons: "", cashSale: "", creditSale: "" },
      { name: "Creek Vista", gallons: "", cashSale: "", creditSale: "" }
    ],
    attendances: {
      shiftA: {
        supervisor: { auth: "", held: "", present: "" },
        deo: { auth: "", held: "", present: "" },
        popt: { auth: "", held: "", present: "" },
        driver: { auth: "", held: "", present: "" },
        helper: { auth: "", held: "", present: "" }
      },
      shiftB: {
        supervisor: { auth: "", held: "", present: "" },
        deo: { auth: "", held: "", present: "" },
        popt: { auth: "", held: "", present: "" },
        driver: { auth: "", held: "", present: "" },
        helper: { auth: "", held: "", present: "" }
      }
    },
    vehicles: {
      owned: "",
      thirdParty: "",
      workshop: ""
    },
    closureLevel: ""
  });

  // Shift Closing Form State
  const [shiftData, setShiftData] = useState({
    date: "",
    shiftTiming: "03 PM To 11 PM",
    levelAtStart: "",
    outstandingCRs: "NIL",
    outstandingDemands: "00",
    outstandingAmount: "NIL",
    cashSlips: { count: "", amount: "" },
    creditSlips: { count: "", amount: "" },
    amountHandedOver: "",
    allBowzerStatus: "--",
    maintenanceCase: "--",
    softwareIssue: "--",
    safeKeys: "DELIVERED TO DHA SERVICES",
    miscPoint: "--",
    levelAtEnd: "",
    roPlant: "540"
  });

  const updateHydrantDistribution = (index, field, value) => {
    const newDistributions = [...hydrantData.distributions];
    newDistributions[index] = { ...newDistributions[index], [field]: value };
    setHydrantData({ ...hydrantData, distributions: newDistributions });
  };

  const updateHydrantAttendance = (shift, role, field, value) => {
    const newAttendances = { ...hydrantData.attendances };
    newAttendances[shift][role][field] = value;
    setHydrantData({ ...hydrantData, attendances: newAttendances });
  };

  const generateHydrantPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20; // Starting position
    
    // Title
    doc.setFontSize(18);
    doc.text("HYDRANT SUMMARY", 105, yPosition, { align: "center" });
    doc.setFontSize(12);
    
    // Header Info
    yPosition = 40;
    doc.text(`1. Level at 7 AM Starting: ${hydrantData.startingLevel}`, 20, yPosition);
    doc.text(`DATE: ${hydrantData.date}`, 150, yPosition);
    
    yPosition = 50;
    doc.text("2. Water Distribution", 20, yPosition);
    
    // Water Distribution Table
    const distributionData = hydrantData.distributions.map(d => [
      d.name, d.gallons, d.cashSale, d.creditSale
    ]);
    
    // Calculate totals
    const totalGallons = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.gallons) || 0), 0);
    const totalCashSale = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.cashSale) || 0), 0);
    const totalCreditSale = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.creditSale) || 0), 0);
    const grandTotal = totalCashSale + totalCreditSale;
    
    // Add total row
    distributionData.push(['Total', totalGallons.toString(), totalCashSale.toString(), totalCreditSale.toString()]);
    
    yPosition = 55;
    let finalY;
    autoTable(doc, {
      startY: yPosition,
      head: [['', 'Total Gallons', 'Cash Sale', 'Credit Sale']],
      body: distributionData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      didDrawPage: (data) => {
        finalY = data.cursor.y;
      }
    });
    
    yPosition = finalY + 10;
    doc.text(`Grand Total (Cash + Credit): ${grandTotal}`, 120, yPosition);
    
    // Attendances
    yPosition += 10;
    doc.text("3. Attendances", 20, yPosition);
    
    // Shift A Table
    const shiftAData = [
      ['Supervisor', 
        hydrantData.attendances.shiftA.supervisor.auth,
        hydrantData.attendances.shiftA.supervisor.held,
        '', '', 
        hydrantData.attendances.shiftA.supervisor.present],
      ['DEO', 
        hydrantData.attendances.shiftA.deo.auth,
        hydrantData.attendances.shiftA.deo.held,
        '', '', 
        hydrantData.attendances.shiftA.deo.present],
      ['P/OPT', 
        hydrantData.attendances.shiftA.popt.auth,
        hydrantData.attendances.shiftA.popt.held,
        '', '', 
        hydrantData.attendances.shiftA.popt.present],
      ['DRIVER', 
        hydrantData.attendances.shiftA.driver.auth,
        hydrantData.attendances.shiftA.driver.held,
        '', '', 
        hydrantData.attendances.shiftA.driver.present],
      ['HELPER', 
        hydrantData.attendances.shiftA.helper.auth,
        hydrantData.attendances.shiftA.helper.held,
        '', '', 
        hydrantData.attendances.shiftA.helper.present],
    ];
    
    // Shift B Table
    const shiftBData = [
      ['Supervisor', 
        hydrantData.attendances.shiftB.supervisor.auth,
        hydrantData.attendances.shiftB.supervisor.held,
        '', '', 
        hydrantData.attendances.shiftB.supervisor.present],
      ['DEO', 
        hydrantData.attendances.shiftB.deo.auth,
        hydrantData.attendances.shiftB.deo.held,
        '', '', 
        hydrantData.attendances.shiftB.deo.present],
      ['P/OPT', 
        hydrantData.attendances.shiftB.popt.auth,
        hydrantData.attendances.shiftB.popt.held,
        '', '', 
        hydrantData.attendances.shiftB.popt.present],
      ['DRIVER', 
        hydrantData.attendances.shiftB.driver.auth,
        hydrantData.attendances.shiftB.driver.held,
        '', '', 
        hydrantData.attendances.shiftB.driver.present],
      ['HELPER', 
        hydrantData.attendances.shiftB.helper.auth,
        hydrantData.attendances.shiftB.helper.held,
        '', '', 
        hydrantData.attendances.shiftB.helper.present],
    ];
    
    // Add the attendance tables side by side
    yPosition += 15;
    const attendanceTableY = yPosition;
    let shiftAfinalY, shiftBfinalY;
    
    // Shift A Table
    autoTable(doc, {
      startY: attendanceTableY,
      head: [['', 'Auth', 'Held', 'Leave', 'Absent', 'Present']],
      body: shiftAData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [150, 150, 150], textColor: [0, 0, 0] },
      margin: { left: 20 },
      tableWidth: 80,
      didDrawPage: (data) => {
        shiftAfinalY = data.cursor.y;
      }
    });
    
    // Shift B Table
    autoTable(doc, {
      startY: attendanceTableY,
      head: [['', 'Auth', 'Held', 'Leave', 'Absent', 'Present']],
      body: shiftBData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [150, 150, 150], textColor: [0, 0, 0] },
      margin: { left: 110 },
      tableWidth: 80,
      didDrawPage: (data) => {
        shiftBfinalY = data.cursor.y;
      }
    });
    
    // Get the highest Y value from both tables
    yPosition = Math.max(shiftAfinalY || attendanceTableY, shiftBfinalY || attendanceTableY);
    
    // Vehicle Status
    yPosition += 15;
    doc.text("4. Vehicle Status", 20, yPosition);
    
    yPosition += 10;
    doc.text(`• Total Vehicles (Own) - ${hydrantData.vehicles.owned}`, 25, yPosition);
    
    yPosition += 10;
    doc.text(`• Total Vehicles (3rdParty) - ${hydrantData.vehicles.thirdParty}`, 25, yPosition);
    
    yPosition += 10;
    doc.text(`• Vehicles in Mt Workshop - ${hydrantData.vehicles.workshop}`, 25, yPosition);
    
    // Closure Level
    yPosition += 20;
    doc.text(`Level at 11:00 PM Closure: ${hydrantData.closureLevel}`, 20, yPosition);
    
    doc.save("hydrant-summary.pdf");
  };

  const generateShiftPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20; // Starting position
    
    // Header
    doc.setFontSize(14);
    doc.text("Defence Housing Authority Services – Karachi", 105, yPosition, { align: "center" });
    
    yPosition = 30;
    doc.setFontSize(12);
    doc.text("174/B, QASIM STREET-1, KHAYABAN-E-SHUJAAT, PHASE-VIII, KARACHI", 105, yPosition, { align: "center" });
    
    // Contact Info
    yPosition = 40;
    doc.setFontSize(10);
    doc.text("Phone: 111-111-895 / 35250061", 150, yPosition);
    
    yPosition = 45;
    doc.text("35251942", 150, yPosition);
    
    yPosition = 50;
    doc.text("Email: info@dhaservices.com", 150, yPosition);
    
    // Title
    yPosition = 60;
    doc.setFontSize(14);
    doc.text("Shift Closing Certificate", 105, yPosition, { align: "center" });
    
    yPosition = 70;
    doc.text("Evening Shift", 105, yPosition, { align: "center" });
    
    // Details boxes
    // Date Box
    yPosition = 80;
    doc.rect(20, yPosition, 50, 15);
    doc.text("Date:", 25, yPosition + 10);
    doc.rect(20, yPosition + 15, 50, 15);
    doc.text(shiftData.date, 25, yPosition + 25);
    
    // Shift Timing Box
    yPosition = 110;
    doc.rect(20, yPosition, 50, 15);
    doc.text("Shift Timing:", 25, yPosition + 10);
    doc.rect(20, yPosition + 15, 50, 15);
    doc.text(shiftData.shiftTiming, 25, yPosition + 25);
    
    // TDS Details Box
    yPosition = 80;
    doc.rect(140, yPosition, 50, 15);
    doc.text("TDS Details:", 145, yPosition + 10);
    doc.rect(140, yPosition + 15, 50, 15);
    doc.text("RO Plant: " + shiftData.roPlant, 145, yPosition + 25);
    doc.rect(140, yPosition + 30, 50, 15);
    doc.text("Hydrant:", 145, yPosition + 40);
    
    // Handover text
    yPosition = 150;
    doc.setFontSize(11);
    doc.text("We have jointly handed/taken over the charge of morning shift. Details is as under:", 105, yPosition, { align: "center" });
    
    // Main table
    const tableData = [
      ["Level at 03:00 PM", shiftData.levelAtStart],
      ["Outstanding CRs", shiftData.outstandingCRs],
      ["Outstanding Demands", shiftData.outstandingDemands],
      ["Outstanding Amount", shiftData.outstandingAmount],
      [`${shiftData.cashSlips.count} Cash Slips`, shiftData.cashSlips.amount, `${Number(shiftData.cashSlips.amount) + Number(shiftData.creditSlips.amount)}`],
      [`${shiftData.creditSlips.count} Credit Slips`, shiftData.creditSlips.amount, ""],
      ["Audit Change", "--"],
      ["Cancelled Slips", "--"],
      ["Amount Handed Over", shiftData.amountHandedOver],
      ["All Bowzer Status", shiftData.allBowzerStatus],
      ["MT Repair / Maintenance Case", shiftData.maintenanceCase],
      ["Software Issue (If Any)", shiftData.softwareIssue],
      ["Safe Keys", shiftData.safeKeys],
      ["Any Other Misc. Point", shiftData.miscPoint],
      ["Level at 11:00 PM", shiftData.levelAtEnd]
    ];
    
    yPosition = 160;
    let tableFinalY;
    
    autoTable(doc, {
      startY: yPosition,
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 }
      },
      didDrawPage: (data) => {
        tableFinalY = data.cursor.y;
      }
    });
    
    // Update yPosition after table is drawn
    yPosition = tableFinalY || yPosition + 100;
    
    // Final text
    yPosition += 15;
    doc.text("There is no outstanding issue except mentioned above.", 20, yPosition);
    
    // Signature blocks
    yPosition += 25;
    doc.rect(20, yPosition, 50, 15);
    doc.text("Handed Over By", 30, yPosition + 8);
    
    yPosition += 25;
    doc.text("Manager", 20, yPosition);
    doc.line(20, yPosition + 2, 120, yPosition + 2);
    
    yPosition += 15;
    doc.text("A/Supervisor", 20, yPosition);
    doc.line(20, yPosition + 2, 120, yPosition + 2);
    
    yPosition += 15;
    doc.text("DEO", 20, yPosition);
    doc.line(20, yPosition + 2, 120, yPosition + 2);
    
    doc.save("shift-closing-report.pdf");
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Generate Reports</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hydrant">Hydrant Summary</TabsTrigger>
          <TabsTrigger value="shift">Shift Closing Report</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hydrant">
          <Card>
            <CardHeader>
              <CardTitle>Generate Hydrant Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hDate">Date</Label>
                  <Input 
                    id="hDate" 
                    value={hydrantData.date}
                    onChange={(e) => setHydrantData({...hydrantData, date: e.target.value})}
                    placeholder="MM/DD/YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startingLevel">Level at 7 AM Starting</Label>
                  <Input 
                    id="startingLevel" 
                    value={hydrantData.startingLevel}
                    onChange={(e) => setHydrantData({...hydrantData, startingLevel: e.target.value})}
                    placeholder="12&apos;-00&quot;"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Water Distribution</h3>
                <div className="grid grid-cols-4 gap-4 mb-2">
                  <div><Label>Location</Label></div>
                  <div><Label>Total Gallons</Label></div>
                  <div><Label>Cash Sale</Label></div>
                  <div><Label>Credit Sale</Label></div>
                </div>
                
                {hydrantData.distributions.map((dist, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 mb-2">
                    <div>
                      <Input disabled value={dist.name} />
                    </div>
                    <div>
                      <Input 
                        value={dist.gallons}
                        onChange={(e) => updateHydrantDistribution(index, 'gallons', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Input 
                        value={dist.cashSale}
                        onChange={(e) => updateHydrantDistribution(index, 'cashSale', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Input 
                        value={dist.creditSale}
                        onChange={(e) => updateHydrantDistribution(index, 'creditSale', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Attendances</h3>
                
                <div className="grid grid-cols-2 gap-8">
                  {/* Shift A */}
                  <div>
                    <h4 className="text-md font-medium mb-3">SHIFT A</h4>
                    
                    <div className="space-y-3">
                      {['supervisor', 'deo', 'popt', 'driver', 'helper'].map((role) => (
                        <div key={role} className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <Label className="capitalize">{role}</Label>
                          </div>
                          <div>
                            <Input 
                              placeholder="Auth"
                              value={hydrantData.attendances.shiftA[role].auth}
                              onChange={(e) => updateHydrantAttendance('shiftA', role, 'auth', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Held"
                              value={hydrantData.attendances.shiftA[role].held}
                              onChange={(e) => updateHydrantAttendance('shiftA', role, 'held', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Present"
                              value={hydrantData.attendances.shiftA[role].present}
                              onChange={(e) => updateHydrantAttendance('shiftA', role, 'present', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Shift B */}
                  <div>
                    <h4 className="text-md font-medium mb-3">SHIFT B</h4>
                    
                    <div className="space-y-3">
                      {['supervisor', 'deo', 'popt', 'driver', 'helper'].map((role) => (
                        <div key={role} className="grid grid-cols-4 gap-2">
                          <div className="col-span-1">
                            <Label className="capitalize">{role}</Label>
                          </div>
                          <div>
                            <Input 
                              placeholder="Auth"
                              value={hydrantData.attendances.shiftB[role].auth}
                              onChange={(e) => updateHydrantAttendance('shiftB', role, 'auth', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Held"
                              value={hydrantData.attendances.shiftB[role].held}
                              onChange={(e) => updateHydrantAttendance('shiftB', role, 'held', e.target.value)}
                            />
                          </div>
                          <div>
                            <Input 
                              placeholder="Present"
                              value={hydrantData.attendances.shiftB[role].present}
                              onChange={(e) => updateHydrantAttendance('shiftB', role, 'present', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Vehicle Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownedVehicles">Total Vehicles (Own)</Label>
                    <Input 
                      id="ownedVehicles" 
                      value={hydrantData.vehicles.owned}
                      onChange={(e) => setHydrantData({
                        ...hydrantData, 
                        vehicles: {...hydrantData.vehicles, owned: e.target.value}
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thirdPartyVehicles">Total Vehicles (3rd Party)</Label>
                    <Input 
                      id="thirdPartyVehicles" 
                      value={hydrantData.vehicles.thirdParty}
                      onChange={(e) => setHydrantData({
                        ...hydrantData, 
                        vehicles: {...hydrantData.vehicles, thirdParty: e.target.value}
                      })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workshopVehicles">Vehicles in Mt Workshop</Label>
                    <Input 
                      id="workshopVehicles" 
                      value={hydrantData.vehicles.workshop}
                      onChange={(e) => setHydrantData({
                        ...hydrantData, 
                        vehicles: {...hydrantData.vehicles, workshop: e.target.value}
                      })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closureLevel">Level at 11:00 PM Closure</Label>
                <Input 
                  id="closureLevel" 
                  value={hydrantData.closureLevel}
                  onChange={(e) => setHydrantData({...hydrantData, closureLevel: e.target.value})}
                  placeholder="10&apos;-01&quot;"
                />
              </div>
              
              <Button className="w-full" onClick={generateHydrantPDF}>Generate Hydrant Summary PDF</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shift">
          <Card>
            <CardHeader>
              <CardTitle>Generate Shift Closing Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sDate">Date</Label>
                  <Input 
                    id="sDate" 
                    value={shiftData.date}
                    onChange={(e) => setShiftData({...shiftData, date: e.target.value})}
                    placeholder="MM-DD-YYYY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftTiming">Shift Timing</Label>
                  <Input 
                    id="shiftTiming" 
                    value={shiftData.shiftTiming}
                    disabled
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="levelAtStart">Level at 03:00 PM</Label>
                  <Input 
                    id="levelAtStart" 
                    value={shiftData.levelAtStart}
                    onChange={(e) => setShiftData({...shiftData, levelAtStart: e.target.value})}
                    placeholder="09&apos;-04&quot;"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roPlant">RO Plant</Label>
                  <Input 
                    id="roPlant" 
                    value={shiftData.roPlant}
                    onChange={(e) => setShiftData({...shiftData, roPlant: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cashSlipsCount">Cash Slips (Count)</Label>
                  <Input 
                    id="cashSlipsCount" 
                    value={shiftData.cashSlips.count}
                    onChange={(e) => setShiftData({
                      ...shiftData, 
                      cashSlips: {...shiftData.cashSlips, count: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashSlipsAmount">Cash Slips (Amount)</Label>
                  <Input 
                    id="cashSlipsAmount" 
                    value={shiftData.cashSlips.amount}
                    onChange={(e) => setShiftData({
                      ...shiftData, 
                      cashSlips: {...shiftData.cashSlips, amount: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditSlipsCount">Credit Slips (Count)</Label>
                  <Input 
                    id="creditSlipsCount" 
                    value={shiftData.creditSlips.count}
                    onChange={(e) => setShiftData({
                      ...shiftData, 
                      creditSlips: {...shiftData.creditSlips, count: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditSlipsAmount">Credit Slips (Amount)</Label>
                  <Input 
                    id="creditSlipsAmount" 
                    value={shiftData.creditSlips.amount}
                    onChange={(e) => setShiftData({
                      ...shiftData, 
                      creditSlips: {...shiftData.creditSlips, amount: e.target.value}
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amountHandedOver">Amount Handed Over</Label>
                <Input 
                  id="amountHandedOver" 
                  value={shiftData.amountHandedOver}
                  onChange={(e) => setShiftData({...shiftData, amountHandedOver: e.target.value})}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="levelAtEnd">Level at 11:00 PM</Label>
                <Input 
                  id="levelAtEnd" 
                  value={shiftData.levelAtEnd}
                  onChange={(e) => setShiftData({...shiftData, levelAtEnd: e.target.value})}
                  placeholder="10&apos;-01&quot;"
                />
              </div>
              
              <Button className="w-full" onClick={generateShiftPDF}>Generate Shift Closing Report PDF</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
