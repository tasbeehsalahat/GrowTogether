import 'package:flutter/material.dart';

class WorkerRequestPage extends StatefulWidget {
  final List<Map<String, dynamic>> lands;

  const WorkerRequestPage({
    Key? key,
    required this.lands,
    required Map<String, dynamic> landDetails,
  }) : super(key: key);

  @override
  _WorkerRequestPageState createState() => _WorkerRequestPageState();
}

class _WorkerRequestPageState extends State<WorkerRequestPage> {
  Map<String, dynamic>? _selectedLand;
  int _workerCount = 1;
  double _dailyWage = 50.0;
  DateTime? _selectedStartDate;
  DateTime? _selectedEndDate;
  TimeOfDay? _startTime;
  TimeOfDay? _endTime;

  // Select date range
  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? pickedDateRange = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime(DateTime.now().year + 1),
    );

    if (pickedDateRange != null) {
      setState(() {
        _selectedStartDate = pickedDateRange.start;
        _selectedEndDate = pickedDateRange.end;
      });
    }
  }

  // Select time
  Future<void> _selectTime(BuildContext context,
      {required bool isStartTime}) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStartTime
          ? (_startTime ?? TimeOfDay.now())
          : (_endTime ?? TimeOfDay.now()),
    );

    if (picked != null) {
      setState(() {
        if (isStartTime) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  // Input field decoration
  InputDecoration _getInputDecoration() {
    return InputDecoration(
      contentPadding: const EdgeInsets.symmetric(horizontal: 15),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(color: Color(0xFF556B2F)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(color: Color(0xFF556B2F)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: const BorderSide(
          color: Color(0xFF556B2F),
          width: 2,
        ),
      ),
      filled: true,
      fillColor: const Color(0xFF556B2F).withOpacity(0.2),
    );
  }

  // Create advertisement
  void _makeAdvertisement() {
    if (_selectedLand == null ||
        _selectedStartDate == null ||
        _selectedEndDate == null ||
        _startTime == null ||
        _endTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please complete all required fields.")),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Advertisement Created"),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Land Details: ${_selectedLand!}"),
              Text("Workers Needed: $_workerCount"),
              Text("Daily Wage: $_dailyWage ILS"),
              Text(
                "Dates: ${_selectedStartDate != null && _selectedEndDate != null ? "${_selectedStartDate!.toLocal()} to ${_selectedEndDate!.toLocal()}" : "Not selected"}",
              ),
              Text(
                "Time: ${_startTime?.format(context)} - ${_endTime?.format(context)}",
              ),
              const SizedBox(height: 10),
              const Text("This advertisement will now be visible to workers."),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text("Done"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF556B2F),
        title: const Text(
          "Request Workers",
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage("image/dis.png"),
            fit: BoxFit.cover,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Select Land",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<Map<String, dynamic>>(
                      decoration: _getInputDecoration(),
                      value: _selectedLand,
                      items: widget.lands.map((land) {
                        return DropdownMenuItem<Map<String, dynamic>>(
                          value: land,
                          child: Text(
                              "Land: ${land['governorate']} - ${land['townOrVillage']}"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedLand = value;
                        });
                      },
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Select Date Range",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      readOnly: true,
                      decoration: _getInputDecoration().copyWith(
                        hintText: _selectedStartDate != null &&
                                _selectedEndDate != null
                            ? "${_selectedStartDate!.toLocal()} - ${_selectedEndDate!.toLocal()}"
                            : "Choose Date Range",
                      ),
                      onTap: () => _selectDateRange(context),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Select Start and End Time",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      readOnly: true,
                      decoration: _getInputDecoration().copyWith(
                        hintText: _startTime != null
                            ? "Start Time: ${_startTime!.format(context)}"
                            : "Choose Start Time",
                      ),
                      onTap: () => _selectTime(context, isStartTime: true),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      readOnly: true,
                      decoration: _getInputDecoration().copyWith(
                        hintText: _endTime != null
                            ? "End Time: ${_endTime!.format(context)}"
                            : "Choose End Time",
                      ),
                      onTap: () => _selectTime(context, isStartTime: false),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Number of Workers",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      initialValue: _workerCount.toString(),
                      keyboardType: TextInputType.number,
                      decoration: _getInputDecoration(),
                      onChanged: (value) {
                        setState(() {
                          _workerCount = int.tryParse(value) ?? _workerCount;
                        });
                      },
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      "Daily Wage (in ILS)",
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      initialValue: _dailyWage.toStringAsFixed(2),
                      keyboardType: TextInputType.number,
                      decoration: _getInputDecoration(),
                      onChanged: (value) {
                        setState(() {
                          _dailyWage = double.tryParse(value) ?? _dailyWage;
                        });
                      },
                    ),
                    const SizedBox(height: 30),
                    Center(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF556B2F),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 30, vertical: 10),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        onPressed: _makeAdvertisement,
                        child: const Text(
                          "Make an Advertisement",
                          style: TextStyle(fontSize: 16, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
