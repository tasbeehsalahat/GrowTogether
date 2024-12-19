import 'package:flutter/material.dart';

class NotificationsPage extends StatefulWidget {
  final List<Map<String, dynamic>> notifications;

  const NotificationsPage({super.key, required this.notifications});

  @override
  _NotificationsPageState createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  List<Map<String, dynamic>> notifications = [];

  @override
  void initState() {
    super.initState();
    notifications = widget.notifications.isNotEmpty
        ? widget.notifications
        : _generateSampleNotifications();
  }

  void _handleAction(int index, bool isAccepted) {
    final action = isAccepted ? "accepted" : "rejected";
    final notification = notifications[index];

    // Show confirmation dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(isAccepted ? "Request Accepted" : "Request Rejected"),
          content: Text(
            "You have $action the request from ${notification['sender']} regarding land ${notification['land']}.",
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  notifications.removeAt(index);
                });
                Navigator.of(context).pop();
              },
              child: const Text("OK"),
            ),
          ],
        );
      },
    );
  }

  void _sendMessage(String recipient) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("Message sent to $recipient."),
      ),
    );
  }

  List<Map<String, dynamic>> _generateSampleNotifications() {
    return [
      {
        "sender": "Worker Ahmed",
        "land": "Governorate A - Town A",
        "message":
            "I would like to work on this land for the specified period.",
        "type": "Worker Request"
      },
      {
        "sender": "Guarantor Fatima",
        "land": "Governorate B - Town B",
        "message": "I want to guarantee this land for the upcoming season.",
        "type": "Guarantee Request"
      },
      {
        "sender": "Worker Sarah",
        "land": "Governorate C - Town C",
        "message": "Available to work immediately on harvesting.",
        "type": "Worker Request"
      },
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Notifications"),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: notifications.isNotEmpty
          ? ListView.builder(
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                return Card(
                  margin:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 3,
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ListTile(
                          leading: CircleAvatar(
                            backgroundColor:
                                notification['type'] == "Worker Request"
                                    ? Colors.blue.withOpacity(0.2)
                                    : Colors.green.withOpacity(0.2),
                            child: Icon(
                              notification['type'] == "Worker Request"
                                  ? Icons.people
                                  : Icons.shield,
                              color: notification['type'] == "Worker Request"
                                  ? Colors.blue
                                  : Colors.green,
                              size: 28,
                            ),
                          ),
                          title: Text(
                            notification['type'] == "Worker Request"
                                ? "Worker Request from ${notification['sender']}"
                                : "Guarantee Request from ${notification['sender']}",
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          subtitle: Text(
                            "Land: ${notification['land']}",
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.black54,
                            ),
                          ),
                        ),
                        const Divider(color: Colors.grey),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            notification['message'],
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.check,
                                  color: Color(0xFF556B2F)),
                              onPressed: () {
                                _handleAction(index, true);
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.red),
                              onPressed: () {
                                _handleAction(index, false);
                              },
                            ),
                            IconButton(
                              icon: const Icon(Icons.message,
                                  color: Colors.green),
                              onPressed: () {
                                _sendMessage(notification['sender']);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            )
          : const Center(
              child: Text(
                "No notifications available.",
                style: TextStyle(fontSize: 16, color: Colors.grey),
              ),
            ),
    );
  }
}
