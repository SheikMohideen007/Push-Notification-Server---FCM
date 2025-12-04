import 'package:flutter/material.dart';

class QueryModule extends StatefulWidget {
  const QueryModule({super.key});

  @override
  State<QueryModule> createState() => _QueryModuleState();
}

class _QueryModuleState extends State<QueryModule> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Query Module')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const <Widget>[Text('This is the Query Module screen.')],
        ),
      ),
    );
  }
}
