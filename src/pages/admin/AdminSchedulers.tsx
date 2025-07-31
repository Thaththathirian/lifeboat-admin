import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  Settings,
  History,
  TrendingUp,
  Users,
  GraduationCap,
  Receipt,
  Bell
} from "lucide-react";

// Mock data for schedulers
const mockSchedulers = [
  {
    id: "SCH001",
    name: "Alumni Status Check",
    description: "Automatically convert students to alumni if they haven't uploaded receipts for 2 years",
    frequency: "Daily",
    lastRun: "2024-02-15 06:00:00",
    nextRun: "2024-02-16 06:00:00",
    status: "Active",
    type: "Student Management",
    affectedCount: 5,
    successCount: 3,
    errorCount: 0
  },
  {
    id: "SCH002",
    name: "Payment Reminder",
    description: "Send payment reminders to students with pending fees",
    frequency: "Weekly",
    lastRun: "2024-02-12 09:00:00",
    nextRun: "2024-02-19 09:00:00",
    status: "Active",
    type: "Communication",
    affectedCount: 25,
    successCount: 22,
    errorCount: 3
  },
  {
    id: "SCH003",
    name: "Donor Report Generation",
    description: "Generate monthly reports for all donors",
    frequency: "Monthly",
    lastRun: "2024-02-01 00:00:00",
    nextRun: "2024-03-01 00:00:00",
    status: "Active",
    type: "Reporting",
    affectedCount: 15,
    successCount: 15,
    errorCount: 0
  },
  {
    id: "SCH004",
    name: "Receipt Validation",
    description: "Validate uploaded receipts and flag discrepancies",
    frequency: "Daily",
    lastRun: "2024-02-15 12:00:00",
    nextRun: "2024-02-16 12:00:00",
    status: "Paused",
    type: "Validation",
    affectedCount: 8,
    successCount: 6,
    errorCount: 2
  },
  {
    id: "SCH005",
    name: "College Status Update",
    description: "Update college registration status based on compliance",
    frequency: "Weekly",
    lastRun: "2024-02-10 15:00:00",
    nextRun: "2024-02-17 15:00:00",
    status: "Active",
    type: "College Management",
    affectedCount: 12,
    successCount: 10,
    errorCount: 2
  }
];

const mockSchedulerHistory = [
  {
    id: "HIST001",
    schedulerId: "SCH001",
    schedulerName: "Alumni Status Check",
    runDate: "2024-02-15 06:00:00",
    status: "Success",
    duration: "2m 30s",
    affectedCount: 5,
    successCount: 3,
    errorCount: 0,
    details: "3 students converted to alumni, 2 students still pending"
  },
  {
    id: "HIST002",
    schedulerId: "SCH002",
    schedulerName: "Payment Reminder",
    runDate: "2024-02-12 09:00:00",
    status: "Success",
    duration: "5m 15s",
    affectedCount: 25,
    successCount: 22,
    errorCount: 3,
    details: "22 reminders sent successfully, 3 failed due to invalid email"
  },
  {
    id: "HIST003",
    schedulerId: "SCH003",
    schedulerName: "Donor Report Generation",
    runDate: "2024-02-01 00:00:00",
    status: "Success",
    duration: "10m 45s",
    affectedCount: 15,
    successCount: 15,
    errorCount: 0,
    details: "All 15 donor reports generated and emailed successfully"
  },
  {
    id: "HIST004",
    schedulerId: "SCH004",
    schedulerName: "Receipt Validation",
    runDate: "2024-02-15 12:00:00",
    status: "Partial Success",
    duration: "3m 20s",
    affectedCount: 8,
    successCount: 6,
    errorCount: 2,
    details: "6 receipts validated, 2 flagged for manual review"
  }
];

export default function AdminSchedulers() {
  const [filter, setFilter] = useState("");
  const [selectedScheduler, setSelectedScheduler] = useState<string | null>(null);
  const [historyDialog, setHistoryDialog] = useState(false);
  const { toast } = useToast();

  const filteredSchedulers = mockSchedulers.filter(scheduler =>
    scheduler.name.toLowerCase().includes(filter.toLowerCase()) ||
    scheduler.type.toLowerCase().includes(filter.toLowerCase()) ||
    scheduler.status.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredHistory = mockSchedulerHistory.filter(history =>
    history.schedulerName.toLowerCase().includes(filter.toLowerCase()) ||
    history.status.toLowerCase().includes(filter.toLowerCase())
  );

  const handleToggleScheduler = (schedulerId: string, action: 'start' | 'pause') => {
    const scheduler = mockSchedulers.find(s => s.id === schedulerId);
    if (scheduler) {
      toast({
        title: `${action === 'start' ? 'Started' : 'Paused'} Scheduler`,
        description: `${scheduler.name} has been ${action === 'start' ? 'started' : 'paused'} successfully`,
      });
    }
  };

  const handleViewHistory = (schedulerId: string) => {
    setSelectedScheduler(schedulerId);
    setHistoryDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'Error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Paused':
        return 'secondary';
      case 'Error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getHistoryStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Success':
        return 'default';
      case 'Partial Success':
        return 'secondary';
      case 'Error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="main-content-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scheduler Management</h2>
      </div>

      <Input
        className="mb-4 max-w-xs"
        placeholder="Filter schedulers..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Schedulers ({filteredSchedulers.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Execution History ({filteredHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6">
            {filteredSchedulers.map(scheduler => (
              <Card key={scheduler.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(scheduler.status)}
                      <div>
                        <CardTitle className="text-lg">{scheduler.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{scheduler.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadgeVariant(scheduler.status)}>
                        {scheduler.status}
                      </Badge>
                      <Badge variant="outline">{scheduler.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Frequency</Label>
                      <p className="text-sm text-muted-foreground">{scheduler.frequency}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Last Run</Label>
                      <p className="text-sm text-muted-foreground">{scheduler.lastRun}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Next Run</Label>
                      <p className="text-sm text-muted-foreground">{scheduler.nextRun}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Success Rate</Label>
                      <p className="text-sm text-muted-foreground">
                        {scheduler.successCount}/{scheduler.affectedCount} ({Math.round((scheduler.successCount / scheduler.affectedCount) * 100)}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={scheduler.status === 'Active' ? 'outline' : 'default'}
                        onClick={() => handleToggleScheduler(scheduler.id, scheduler.status === 'Active' ? 'pause' : 'start')}
                      >
                        {scheduler.status === 'Active' ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {scheduler.status === 'Active' ? 'Pause' : 'Start'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewHistory(scheduler.id)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        History
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Affected: {scheduler.affectedCount}</span>
                      <span>Success: {scheduler.successCount}</span>
                      <span>Errors: {scheduler.errorCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheduler</TableHead>
                    <TableHead>Run Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map(history => (
                    <TableRow key={history.id}>
                      <TableCell>
                        <div className="font-medium">{history.schedulerName}</div>
                        <div className="text-sm text-muted-foreground">{history.details}</div>
                      </TableCell>
                      <TableCell>{history.runDate}</TableCell>
                      <TableCell>
                        <Badge variant={getHistoryStatusBadgeVariant(history.status)}>
                          {history.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{history.duration}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Affected: {history.affectedCount}</div>
                          <div>Success: {history.successCount}</div>
                          <div>Errors: {history.errorCount}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History Details Dialog */}
      <Dialog open={historyDialog} onOpenChange={setHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scheduler History Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedScheduler && (
              <div>
                <h3 className="font-semibold mb-2">
                  {mockSchedulers.find(s => s.id === selectedScheduler)?.name}
                </h3>
                <div className="space-y-2">
                  {mockSchedulerHistory
                    .filter(h => h.schedulerId === selectedScheduler)
                    .map(history => (
                      <div key={history.id} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{history.runDate}</span>
                          <Badge variant={getHistoryStatusBadgeVariant(history.status)}>
                            {history.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Duration: {history.duration}
                        </div>
                        <div className="text-sm">
                          {history.details}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 