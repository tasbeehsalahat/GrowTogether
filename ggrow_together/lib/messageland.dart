import 'package:flutter/material.dart';

class MessagingHomePage extends StatelessWidget {
  final List<Map<String, dynamic>> contacts = [
    {"name": "Ahmed", "lastMessage": "Hi, how are you?", "isOnline": true},
    {
      "name": "Sara",
      "lastMessage": "Can you send the report?",
      "isOnline": false
    },
    {"name": "Omar", "lastMessage": "Let's meet tomorrow.", "isOnline": true},
    {"name": "Huda", "lastMessage": "Okay, got it!", "isOnline": false},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Messages"),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: ListView.builder(
        itemCount: contacts.length,
        itemBuilder: (context, index) {
          final contact = contacts[index];
          return ListTile(
            leading: CircleAvatar(
              backgroundColor: contact["isOnline"]
                  ? Colors.greenAccent
                  : Colors.grey.shade400,
              child: Text(
                contact["name"][0],
                style: const TextStyle(color: Colors.white),
              ),
            ),
            title: Text(
              contact["name"],
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            subtitle: Text(
              contact["lastMessage"],
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            trailing: Icon(
              Icons.circle,
              color: contact["isOnline"] ? Colors.green : Colors.grey,
              size: 10,
            ),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) =>
                      MessagingPage(contactName: contact["name"]),
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class MessagingPage extends StatefulWidget {
  final String contactName;

  const MessagingPage({Key? key, required this.contactName}) : super(key: key);

  @override
  _MessagingPageState createState() => _MessagingPageState();
}

class _MessagingPageState extends State<MessagingPage> {
  final List<Map<String, dynamic>> messages = [
    {"text": "Hi, how are you?", "isSent": false},
    {"text": "I'm good, thank you! How about you?", "isSent": true},
    {"text": "I'm doing great. What's the update on Land A?", "isSent": false},
    {"text": "The worker request has been approved.", "isSent": true},
  ];

  final TextEditingController _messageController = TextEditingController();

  void _sendMessage() {
    if (_messageController.text.isNotEmpty) {
      setState(() {
        messages.add({"text": _messageController.text, "isSent": true});
      });
      _messageController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.greenAccent,
              child: Text(
                widget.contactName[0],
                style: const TextStyle(color: Colors.white),
              ),
            ),
            const SizedBox(width: 10),
            Text(widget.contactName),
          ],
        ),
        backgroundColor: const Color(0xFF556B2F),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true,
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final message = messages[messages.length - 1 - index];
                return Align(
                  alignment: message["isSent"]
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(
                        vertical: 5.0, horizontal: 10.0),
                    padding: const EdgeInsets.all(10.0),
                    decoration: BoxDecoration(
                      color: message["isSent"]
                          ? const Color(0xFF81C784)
                          : Colors.grey.shade300,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(10),
                        topRight: const Radius.circular(10),
                        bottomLeft: message["isSent"]
                            ? const Radius.circular(10)
                            : const Radius.circular(0),
                        bottomRight: message["isSent"]
                            ? const Radius.circular(0)
                            : const Radius.circular(10),
                      ),
                    ),
                    child: Text(
                      message["text"],
                      style: TextStyle(
                          color: message["isSent"]
                              ? Colors.white
                              : Colors.black87),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
            color: Colors.grey.shade200,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: "Type a message...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      filled: true,
                      fillColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send, color: Color(0xFF556B2F)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
