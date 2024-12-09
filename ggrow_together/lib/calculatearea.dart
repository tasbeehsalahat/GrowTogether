import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' as latlong;
import 'package:geolocator/geolocator.dart';

class LandAreaCalculator extends StatefulWidget {
  final Function(double area, latlong.LatLng? centroid) onLandAdded;

  const LandAreaCalculator({Key? key, required this.onLandAdded})
      : super(key: key);

  @override
  _LandAreaCalculatorState createState() => _LandAreaCalculatorState();
}

class _LandAreaCalculatorState extends State<LandAreaCalculator> {
  final List<latlong.LatLng> _points = [];
  final MapController _mapController = MapController();
  double _area = 0.0;
  latlong.LatLng? _centroid;
  latlong.LatLng? _currentLocation;

  @override
  void initState() {
    super.initState();
    _determineCurrentLocation();
  }

  @override
  void dispose() {
    _mapController.dispose(); // التخلص من MapController عند التخلص من widget
    super.dispose();
  }

  Future<void> _determineCurrentLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Location services are disabled.")),
          );
        }
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text("Location permission is denied.")),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Location permissions are permanently denied."),
            ),
          );
        }
        return;
      }

      final Position position = await Geolocator.getCurrentPosition();
      if (mounted) {
        setState(() {
          _currentLocation =
              latlong.LatLng(position.latitude, position.longitude);
        });

        if (_currentLocation != null) {
          _mapController.move(_currentLocation!, 21.0); // مستوى تكبير عالٍ
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error determining location: $e")),
        );
      }
    }
  }

  void _onMapTap(latlong.LatLng point) {
    setState(() {
      _points.add(point);
      if (_points.length > 2) {
        _calculatePolygonArea();
        _calculateCentroid();
      }
    });
  }

  void _calculatePolygonArea() {
    if (_points.length < 3) return;

    double area = 0.0;

    for (int i = 0; i < _points.length; i++) {
      final latlong.LatLng current = _points[i];
      final latlong.LatLng next = _points[(i + 1) % _points.length];
      area += (current.longitude * next.latitude) -
          (next.longitude * current.latitude);
    }

    area = area.abs() / 2.0;

    const double earthRadius = 6378137;
    area = (area * (earthRadius * earthRadius)) / 1e6;

    setState(() {
      _area = area;
    });
  }

  void _calculateCentroid() {
    if (_points.isEmpty) return;

    double latitudeSum = 0.0;
    double longitudeSum = 0.0;

    for (var point in _points) {
      latitudeSum += point.latitude;
      longitudeSum += point.longitude;
    }

    setState(() {
      _centroid = latlong.LatLng(
        latitudeSum / _points.length,
        longitudeSum / _points.length,
      );
    });
  }

  void _resetMap() {
    setState(() {
      _points.clear();
      _area = 0.0;
      _centroid = null;
    });

    if (_currentLocation != null) {
      _mapController.move(_currentLocation!, 21.0);
    }
  }

  void _onDone() {
    if (_points.length < 3 || _centroid == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content:
              Text("Please select at least 3 points to calculate the area."),
        ),
      );
      return;
    }

    Navigator.pop(context, {'area': _area, 'centroid': _centroid});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Land Area Calculator",
          style: TextStyle(fontSize: 18, color: Colors.white),
        ),
        backgroundColor: const Color(0xFF556B2F),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _resetMap,
          ),
          IconButton(
            icon: const Icon(Icons.done, color: Colors.white),
            onPressed: _onDone,
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter:
                  _currentLocation ?? latlong.LatLng(32.2211, 35.2544),
              initialZoom: 21.0, // مستوى تكبير عالٍ
              onTap: (_, point) => _onMapTap(point),
            ),
            children: [
              TileLayer(
                urlTemplate:
                    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              ),
              if (_points.isNotEmpty)
                PolygonLayer(
                  polygons: [
                    Polygon(
                      points: _points,
                      borderColor: Colors.blue,
                      borderStrokeWidth: 2,
                      color: Colors.blue.withOpacity(0.3),
                    ),
                  ],
                ),
              MarkerLayer(
                markers: [
                  if (_currentLocation != null)
                    Marker(
                      point: _currentLocation!,
                      width: 40,
                      height: 40,
                      child: const Icon(
                        Icons.my_location,
                        color: Colors.blue,
                        size: 30,
                      ),
                    ),
                  ..._points.map(
                    (point) => Marker(
                      point: point,
                      width: 30,
                      height: 30,
                      child: const Icon(Icons.location_on, color: Colors.red),
                    ),
                  ),
                  if (_centroid != null)
                    Marker(
                      point: _centroid!,
                      width: 30,
                      height: 30,
                      child: const Icon(Icons.star, color: Colors.green),
                    ),
                ],
              ),
            ],
          ),
          Positioned(
            bottom: 20,
            left: 20,
            child: Container(
              padding: const EdgeInsets.all(10),
              color: Colors.white,
              child: Text(
                "Area: ${_area.toStringAsFixed(4)} km²\nCentroid: ${_centroid?.latitude.toStringAsFixed(4)}, ${_centroid?.longitude.toStringAsFixed(4)}",
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
