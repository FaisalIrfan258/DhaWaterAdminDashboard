"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPDFGenerator } from "../../../lib/pdfGenerator";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


function ReportsPageContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hydrant");

  // Hydrant Summary Form State
  const [hydrantData, setHydrantData] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
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
    date: new Date().toISOString().split('T')[0], // Default to today
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
    const formattedDate = new Date(hydrantData.date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    // Calculate totals
    const totalGallons = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.gallons) || 0), 0);
    const totalCashSale = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.cashSale) || 0), 0);
    const totalCreditSale = hydrantData.distributions.reduce((sum, d) => sum + (Number(d.creditSale) || 0), 0);
    const grandTotal = totalCashSale + totalCreditSale;
    
    const pdf = createPDFGenerator().init();
    
    // Header
    pdf.addHeader({
      title: 'HYDRANT SUMMARY',
      subtitle: 'Defence Housing Authority Services – Karachi',
      showLogo: false
    });
    
    // Key information
    const keyInfo = [
      { key: 'Report Date', value: formattedDate },
      { key: 'Level at 7 AM Starting', value: hydrantData.startingLevel },
      { key: 'Level at 11:00 PM Closure', value: hydrantData.closureLevel },
      { key: 'Grand Total (Cash + Credit)', value: grandTotal.toLocaleString() }
    ];
    
    pdf.addKeyValueSection(keyInfo, { columns: 2 });
    
    // Water Distribution Table
    const distributionData = hydrantData.distributions.map(d => [
      d.name, d.gallons, d.cashSale, d.creditSale
    ]);
    distributionData.push(['Total', totalGallons.toString(), totalCashSale.toString(), totalCreditSale.toString()]);
    
    pdf.addTable({
      title: '2. Water Distribution',
      headers: ['', 'Total Gallons', 'Cash Sale', 'Credit Sale'],
      data: distributionData,
      theme: 'grid',
      headerStyles: { fillColor: [66, 139, 202], textColor: [255, 255, 255] }
    });
    
    // Shift A Attendance Table
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
        hydrantData.attendances.shiftA.helper.present]
    ];
    
    pdf.addTable({
      title: '3. Attendances - Shift A',
      headers: ['', 'Auth', 'Held', 'Leave', 'Absent', 'Present'],
      data: shiftAData,
      theme: 'grid',
      headerStyles: { fillColor: [40, 167, 69], textColor: [255, 255, 255] }
    });
    
    // Shift B Attendance Table
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
        hydrantData.attendances.shiftB.helper.present]
    ];
    
    pdf.addTable({
      title: 'Attendances - Shift B',
      headers: ['', 'Auth', 'Held', 'Leave', 'Absent', 'Present'],
      data: shiftBData,
      theme: 'grid',
      headerStyles: { fillColor: [255, 193, 7], textColor: [0, 0, 0] }
    });
    
    // Vehicle Status
    pdf.addSectionTitle('4. Vehicle Status');
    const vehicleInfo = [
      { key: 'Total Vehicles (Own)', value: hydrantData.vehicles.owned },
      { key: 'Total Vehicles (3rd Party)', value: hydrantData.vehicles.thirdParty },
      { key: 'Vehicles in Mt Workshop', value: hydrantData.vehicles.workshop }
    ];
    pdf.addKeyValueSection(vehicleInfo, { columns: 1 });
    
    pdf.addFooter();
    pdf.save("hydrant-summary.pdf");
    toast.success("Hydrant Summary PDF generated successfully");
  };

  const generateShiftPDF = () => {
    const formattedDate = new Date(shiftData.date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    
    const pdf = createPDFGenerator().init();
    
    // Header
    pdf.addHeader({
      title: 'SHIFT CLOSING CERTIFICATE',
      subtitle: 'Defence Housing Authority Services – Karachi',
      department: 'Evening Shift',
      showLogo: false
    });
    
    // Key information
    const keyInfo = [
      { key: 'Date', value: formattedDate },
      { key: 'Shift Timing', value: shiftData.shiftTiming },
      { key: 'RO Plant', value: shiftData.roPlant }
    ];
    
    pdf.addKeyValueSection(keyInfo, { columns: 3 });
    
    // Handover text
    pdf.addText('We have jointly handed/taken over the charge of morning shift. Details is as under:', { 
      fontSize: 11, 
      align: 'center',
      marginTop: 20 
    });
    
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
    
    pdf.addTable({
      title: 'Shift Details',
      headers: ['Particulars', 'Value', 'Total'],
      data: tableData,
      theme: 'grid',
      headerStyles: { fillColor: [52, 58, 64], textColor: [255, 255, 255] },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 },
        1: { halign: 'center', cellWidth: 50 },
        2: { halign: 'center', cellWidth: 40 }
      }
    });
    
    // Final text
    pdf.addText('There is no outstanding issue except mentioned above.', { 
      fontSize: 11, 
      marginTop: 15 
    });
    
    // Signature blocks
    const signatures = [
      { title: 'Handed Over By', name: '_____________' },
      { title: 'Manager', name: '_____________' },
      { title: 'A/Supervisor', name: '_____________' },
      { title: 'DEO', name: '_____________' }
    ];
    
    pdf.addSignatureBlocks(signatures, { columns: 4, marginTop: 25 });
    
    pdf.addFooter();
    pdf.save("shift-closing-report.pdf");
    toast.success("Shift Closing Certificate PDF generated successfully");
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
                    type="date"
                    value={hydrantData.date}
                    onChange={(e) => setHydrantData({...hydrantData, date: e.target.value})}
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
                    type="date"
                    value={shiftData.date}
                    onChange={(e) => setShiftData({...shiftData, date: e.target.value})}
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

export default function ReportsPage() {
  return (
    <ProtectedRoute requireSuperAdmin={true}>
      <ReportsPageContent />
    </ProtectedRoute>
  );
}
