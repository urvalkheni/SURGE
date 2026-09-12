import re

registry_code = '''# -------------------------------------------------------------------------
# UNIVERSAL 24-STATE PAN-INDIA STATE, CITY & AREA RENEWABLE REGISTRY
# -------------------------------------------------------------------------
STATE_CITY_REGISTRY = {
    "gujarat": {
        "state_name": "Gujarat",
        "grid_operator": "Gujarat SLDC (GETCO) / WRLDC",
        "cities": {
            "ahmedabad": {
                "city_name": "Ahmedabad",
                "discom": "Torrent Power / UGVCL",
                "latitude": 23.0225,
                "longitude": 72.5714,
                "solar_park": "Ahmedabad Clean Energy Hub",
                "wind_park": "Dholera Wind Feeder",
                "tilt_deg": 22.0,
                "demand_baseline_mw": 120.0,
                "areas": {
                    "sanand": {
                        "area_name": "Sanand (Auto Belt & Solar Park)",
                        "substation": "UGVCL 66kV Sanand Substation",
                        "latitude": 22.9868,
                        "longitude": 72.3814,
                        "solar_park": "Sanand Solar PV Cluster",
                        "wind_park": "Sanand-Bavla Wind Line",
                        "tilt_deg": 22.0,
                        "demand_baseline_mw": 115.0
                    },
                    "dholera": {
                        "area_name": "Dholera SIR (Ultra Mega RE Zone)",
                        "substation": "GETCO 400kV Dholera Pooling Station",
                        "latitude": 22.2471,
                        "longitude": 72.1930,
                        "solar_park": "Dholera 5000 MW Solar Park Block A",
                        "wind_park": "Dholera Coastal Wind Farm",
                        "tilt_deg": 22.0,
                        "demand_baseline_mw": 70.0
                    },
                    "gift_city": {
                        "area_name": "GIFT City (Smart Microgrid)",
                        "substation": "Torrent Power Green Grid Station",
                        "latitude": 23.1600,
                        "longitude": 72.6840,
                        "solar_park": "GIFT City Rooftop Solar Array",
                        "wind_park": "Gandhinagar Wind Feeder",
                        "tilt_deg": 22.0,
                        "demand_baseline_mw": 65.0
                    },
                    "sg_highway": {
                        "area_name": "SG Highway (Commercial Rooftop Grid)",
                        "substation": "Torrent Power 132kV Thaltej Grid",
                        "latitude": 23.0338,
                        "longitude": 72.5070,
                        "solar_park": "SG Commercial Solar Network",
                        "wind_park": "Western Corridor Wind Feeder",
                        "tilt_deg": 22.0,
                        "demand_baseline_mw": 130.0
                    }
                }
            },
            "kutch": {
                "city_name": "Kutch (Khavda RE Park)",
                "discom": "GETCO (400kV Khavda Pooling)",
                "latitude": 23.8340,
                "longitude": 69.8320,
                "solar_park": "Khavda 30 GW Hybrid Renewable Park",
                "wind_park": "Kutch High-Velocity Wind Cluster",
                "tilt_deg": 23.0,
                "demand_baseline_mw": 45.0,
                "areas": {
                    "khavda_core": {
                        "area_name": "Khavda Core Hybrid Zone",
                        "substation": "GETCO 765kV Khavda Interconnect",
                        "latitude": 23.8340,
                        "longitude": 69.8320,
                        "solar_park": "Khavda Phase 1 Solar Farm",
                        "wind_park": "Khavda Rann Wind Farm",
                        "tilt_deg": 23.0,
                        "demand_baseline_mw": 40.0
                    },
                    "bhuj": {
                        "area_name": "Bhuj Industrial & Solar Grid",
                        "substation": "PGVCL 220kV Bhuj Substation",
                        "latitude": 23.2420,
                        "longitude": 69.6669,
                        "solar_park": "Bhuj Clean Energy Cluster",
                        "wind_park": "Mundra Wind Feeder",
                        "tilt_deg": 23.0,
                        "demand_baseline_mw": 85.0
                    }
                }
            }
        }
    },
    "rajasthan": {
        "state_name": "Rajasthan",
        "grid_operator": "Rajasthan SLDC (RVPN) / NRLDC",
        "cities": {
            "jodhpur": {
                "city_name": "Jodhpur (Bhadla Solar Hub)",
                "discom": "Jodhpur Vidyut Vitran Nigam (JdVVNL)",
                "latitude": 27.5398,
                "longitude": 71.9153,
                "solar_park": "Bhadla Phase IV Solar Park (2,245 MW)",
                "wind_park": "Osian Wind Turbine Farm",
                "tilt_deg": 26.0,
                "demand_baseline_mw": 85.0,
                "areas": {
                    "bhadla_iv": {
                        "area_name": "Bhadla Phase IV (Central Inverter Block)",
                        "substation": "RVPN 400kV Bhadla Substation",
                        "latitude": 27.5398,
                        "longitude": 71.9153,
                        "solar_park": "Bhadla 100 MW Fixed-Tilt Block",
                        "wind_park": "Phalodi Wind Line",
                        "tilt_deg": 26.0,
                        "demand_baseline_mw": 80.0
                    },
                    "osian": {
                        "area_name": "Osian Desert Feeder",
                        "substation": "RVPN 132kV Osian Grid",
                        "latitude": 26.7262,
                        "longitude": 72.8753,
                        "solar_park": "Osian Agrivoltaic Cluster",
                        "wind_park": "Osian-Tiwri Wind Array",
                        "tilt_deg": 26.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            },
            "jaisalmer": {
                "city_name": "Jaisalmer (Thar Wind Corridor)",
                "discom": "RVPN 765kV Fatehgarh Pool",
                "latitude": 26.9157,
                "longitude": 70.9083,
                "solar_park": "Jaisalmer Desert Solar Park",
                "wind_park": "Jaisalmer 1,064 MW Wind Complex",
                "tilt_deg": 26.0,
                "demand_baseline_mw": 45.0,
                "areas": {
                    "fatehgarh": {
                        "area_name": "Fatehgarh 765kV RE Pooling Station",
                        "substation": "PGCIL 765kV Fatehgarh Pooling Station",
                        "latitude": 26.4950,
                        "longitude": 71.0500,
                        "solar_park": "Fatehgarh Mega Solar Field",
                        "wind_park": "Fatehgarh Wind Turbine Fleet",
                        "tilt_deg": 26.0,
                        "demand_baseline_mw": 40.0
                    }
                }
            }
        }
    },
    "maharashtra": {
        "state_name": "Maharashtra",
        "grid_operator": "Maharashtra SLDC (MSETCL) / WRLDC",
        "cities": {
            "pune": {
                "city_name": "Pune (Auto & Tech Corridor)",
                "discom": "MSEDCL (Mahavitaran)",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "solar_park": "Pune Rooftop Solar Network",
                "wind_park": "Satara Wind Corridor",
                "tilt_deg": 19.0,
                "demand_baseline_mw": 140.0,
                "areas": {
                    "chakan": {
                        "area_name": "Chakan MIDC Industrial Grid",
                        "substation": "MSETCL 220kV Chakan Substation",
                        "latitude": 18.7500,
                        "longitude": 73.8500,
                        "solar_park": "Chakan Industrial Solar Array",
                        "wind_park": "Shirwal Wind Link",
                        "tilt_deg": 19.0,
                        "demand_baseline_mw": 135.0
                    },
                    "hinjawadi": {
                        "area_name": "Hinjawadi IT Park Microgrid",
                        "substation": "MSEDCL 132kV Hinjawadi Station",
                        "latitude": 18.5913,
                        "longitude": 73.7389,
                        "solar_park": "Hinjawadi Rooftop Solar Network",
                        "wind_park": "Mulshi Wind Feeder",
                        "tilt_deg": 19.0,
                        "demand_baseline_mw": 90.0
                    }
                }
            },
            "solapur": {
                "city_name": "Solapur (Ultra Solar Park)",
                "discom": "MSEDCL Solapur Circle",
                "latitude": 17.6599,
                "longitude": 75.9064,
                "solar_park": "Solapur Mega Solar Plant",
                "wind_park": "Mohol Wind Farm",
                "tilt_deg": 18.0,
                "demand_baseline_mw": 75.0,
                "areas": {
                    "mohol": {
                        "area_name": "Mohol Solar Belt",
                        "substation": "MSETCL 220kV Mohol Substation",
                        "latitude": 17.8100,
                        "longitude": 75.6500,
                        "solar_park": "Mohol Central Solar Field",
                        "wind_park": "Solapur-Osmanabad Wind Feeder",
                        "tilt_deg": 18.0,
                        "demand_baseline_mw": 60.0
                    }
                }
            }
        }
    },
    "karnataka": {
        "state_name": "Karnataka",
        "grid_operator": "Karnataka SLDC (KPTCL) / SRLDC",
        "cities": {
            "pavagada": {
                "city_name": "Pavagada (Shakti Sthala 2,050 MW)",
                "discom": "BESCOM (220kV Pavagada Grid)",
                "latitude": 14.1610,
                "longitude": 77.2620,
                "solar_park": "Shakti Sthala Pavagada Ultra Mega Solar",
                "wind_park": "Chitradurga Wind Link",
                "tilt_deg": 14.0,
                "demand_baseline_mw": 60.0,
                "areas": {
                    "shakti_sthala": {
                        "area_name": "Shakti Sthala Block 1",
                        "substation": "KPTCL 400kV Pavagada Pooling Substation",
                        "latitude": 14.1610,
                        "longitude": 77.2620,
                        "solar_park": "Pavagada Block A Monocrystalline Array",
                        "wind_park": "Rayalaseema Wind Interconnect",
                        "tilt_deg": 14.0,
                        "demand_baseline_mw": 55.0
                    }
                }
            },
            "chitradurga": {
                "city_name": "Chitradurga (Wind Basin)",
                "discom": "BESCOM Chitradurga",
                "latitude": 14.2251,
                "longitude": 76.3980,
                "solar_park": "Chitradurga Solar Feeder",
                "wind_park": "Jogimatti & Hiriyur Wind Farms",
                "tilt_deg": 14.0,
                "demand_baseline_mw": 65.0,
                "areas": {
                    "hiriyur": {
                        "area_name": "Hiriyur Wind Complex",
                        "substation": "KPTCL 220kV Hiriyur Substation",
                        "latitude": 13.9450,
                        "longitude": 76.6200,
                        "solar_park": "Hiriyur Solar Park",
                        "wind_park": "Hiriyur High-Yield Wind Turbines",
                        "tilt_deg": 14.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            }
        }
    },
    "tamil_nadu": {
        "state_name": "Tamil Nadu",
        "grid_operator": "Tamil Nadu SLDC (TANTRANSCO) / SRLDC",
        "cities": {
            "tirunelveli": {
                "city_name": "Tirunelveli (Muppandal Wind Pass)",
                "discom": "TANGEDCO Tirunelveli Circle",
                "latitude": 8.2440,
                "longitude": 77.5500,
                "solar_park": "Kamuthi Ultra Mega Solar (648 MW)",
                "wind_park": "Muppandal Wind Complex (1,500 MW)",
                "tilt_deg": 9.0,
                "demand_baseline_mw": 75.0,
                "areas": {
                    "muppandal": {
                        "area_name": "Muppandal Wind Gorge Feeder",
                        "substation": "TANTRANSCO 230kV Muppandal Substation",
                        "latitude": 8.2440,
                        "longitude": 77.5500,
                        "solar_park": "Aralvaimozhi Solar Array",
                        "wind_park": "Muppandal Coastal Jet Wind Corridor",
                        "tilt_deg": 9.0,
                        "demand_baseline_mw": 65.0
                    }
                }
            },
            "chennai": {
                "city_name": "Chennai (Industrial Grid)",
                "discom": "TANGEDCO Chennai",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "solar_park": "Chennai Commercial Rooftop Grid",
                "wind_park": "Kanchipuram Wind Feeder",
                "tilt_deg": 13.0,
                "demand_baseline_mw": 160.0,
                "areas": {
                    "sriperumbudur": {
                        "area_name": "Sriperumbudur Industrial Substation",
                        "substation": "TANTRANSCO 400kV Sriperumbudur Grid",
                        "latitude": 12.9667,
                        "longitude": 79.9500,
                        "solar_park": "Sriperumbudur Industrial Solar PV",
                        "wind_park": "Southern Coastal Wind Link",
                        "tilt_deg": 13.0,
                        "demand_baseline_mw": 150.0
                    }
                }
            }
        }
    },
    "madhya_pradesh": {
        "state_name": "Madhya Pradesh",
        "grid_operator": "MP SLDC (MPPTCL) / WRLDC",
        "cities": {
            "rewa": {
                "city_name": "Rewa (Ultra Mega Solar 750 MW)",
                "discom": "MP Poorv Kshetra Vidyut Vitaran (MPPKVVCL)",
                "latitude": 24.5362,
                "longitude": 81.3037,
                "solar_park": "Rewa Ultra Mega Solar Park (DMRC/DVC)",
                "wind_park": "Satna Wind Line",
                "tilt_deg": 24.0,
                "demand_baseline_mw": 60.0,
                "areas": {
                    "gurh": {
                        "area_name": "Gurh Tehsil Solar Array Block",
                        "substation": "MPPTCL 400kV Rewa Pooling Station",
                        "latitude": 24.5100,
                        "longitude": 81.5200,
                        "solar_park": "Rewa Central Inverter Block A",
                        "wind_park": "Rewa Plateau Wind Feeder",
                        "tilt_deg": 24.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            },
            "indore": {
                "city_name": "Indore (Pithampur Hub)",
                "discom": "MP Paschim Kshetra (MPWZ)",
                "latitude": 22.7196,
                "longitude": 75.8577,
                "solar_park": "Malwa Solar Network",
                "wind_park": "Dewas & Nagda Wind Farms",
                "tilt_deg": 22.0,
                "demand_baseline_mw": 125.0,
                "areas": {
                    "pithampur": {
                        "area_name": "Pithampur Auto & Pharma Belt",
                        "substation": "MPPTCL 220kV Pithampur Grid",
                        "latitude": 22.6100,
                        "longitude": 75.6900,
                        "solar_park": "Pithampur Industrial Solar Grid",
                        "wind_park": "Dewas Wind Line",
                        "tilt_deg": 22.0,
                        "demand_baseline_mw": 120.0
                    }
                }
            }
        }
    },
    "andhra_pradesh": {
        "state_name": "Andhra Pradesh",
        "grid_operator": "APTRANSCO / SRLDC",
        "cities": {
            "kurnool": {
                "city_name": "Kurnool (Ultra Mega Solar 1,000 MW)",
                "discom": "APCPDCL / PGCIL",
                "latitude": 15.8281,
                "longitude": 78.0373,
                "solar_park": "Kurnool Ultra Mega Solar Park",
                "wind_park": "Orvakal Wind Turbine Farm",
                "tilt_deg": 16.0,
                "demand_baseline_mw": 65.0,
                "areas": {
                    "gani_sakunala": {
                        "area_name": "Gani-Sakunala Solar Complex",
                        "substation": "APTRANSCO 400kV Gani Substation",
                        "latitude": 15.6500,
                        "longitude": 78.2500,
                        "solar_park": "Gani 500 MW Solar Array",
                        "wind_park": "Kurnool Plateau Wind Line",
                        "tilt_deg": 16.0,
                        "demand_baseline_mw": 55.0
                    }
                }
            }
        }
    },
    "telangana": {
        "state_name": "Telangana",
        "grid_operator": "TSTRANSCO / SRLDC",
        "cities": {
            "hyderabad": {
                "city_name": "Hyderabad (Tech Grid)",
                "discom": "TSSPDCL",
                "latitude": 17.3850,
                "longitude": 78.4867,
                "solar_park": "Genome Valley Clean Solar Array",
                "wind_park": "Telangana South Wind Feeder",
                "tilt_deg": 17.0,
                "demand_baseline_mw": 150.0,
                "areas": {
                    "gachibowli": {
                        "area_name": "Gachibowli Cyber Microgrid",
                        "substation": "TSTRANSCO 220kV Gachibowli Station",
                        "latitude": 17.4400,
                        "longitude": 78.3489,
                        "solar_park": "Gachibowli Commercial Solar",
                        "wind_park": "Shadnagar Wind Link",
                        "tilt_deg": 17.0,
                        "demand_baseline_mw": 140.0
                    }
                }
            }
        }
    },
    "uttar_pradesh": {
        "state_name": "Uttar Pradesh",
        "grid_operator": "UPPTCL / NRLDC",
        "cities": {
            "mirzapur": {
                "city_name": "Mirzapur (Vindhyachal Solar Hub)",
                "discom": "Purvanchal Vidyut Vitaran (PuVVNL)",
                "latitude": 25.1460,
                "longitude": 82.5690,
                "solar_park": "Mirzapur Mega Solar Park",
                "wind_park": "Vindhya Escarpment Feeder",
                "tilt_deg": 25.0,
                "demand_baseline_mw": 75.0,
                "areas": {
                    "chunar": {
                        "area_name": "Chunar Industrial Solar Grid",
                        "substation": "UPPTCL 220kV Chunar Substation",
                        "latitude": 25.1200,
                        "longitude": 82.8800,
                        "solar_park": "Chunar Solar PV Station",
                        "wind_park": "Eastern UP Wind Feeder",
                        "tilt_deg": 25.0,
                        "demand_baseline_mw": 65.0
                    }
                }
            }
        }
    },
    "punjab": {
        "state_name": "Punjab",
        "grid_operator": "PSTCL / NRLDC",
        "cities": {
            "bathinda": {
                "city_name": "Bathinda (Clean Energy Hub)",
                "discom": "PSPCL Bathinda",
                "latitude": 30.2110,
                "longitude": 74.9455,
                "solar_park": "Bathinda Agrivoltaic Solar Park",
                "wind_park": "Malwa Wind Cluster",
                "tilt_deg": 30.0,
                "demand_baseline_mw": 85.0,
                "areas": {
                    "talwandi_sabo": {
                        "area_name": "Talwandi Sabo Grid",
                        "substation": "PSTCL 400kV Talwandi Sabo Station",
                        "latitude": 29.9800,
                        "longitude": 75.0900,
                        "solar_park": "Talwandi Sabo Solar Farm",
                        "wind_park": "Punjab Agro-Wind Link",
                        "tilt_deg": 30.0,
                        "demand_baseline_mw": 75.0
                    }
                }
            }
        }
    },
    "haryana": {
        "state_name": "Haryana",
        "grid_operator": "HVPNL / NRLDC",
        "cities": {
            "mahendragarh": {
                "city_name": "Mahendragarh (Solar Belt)",
                "discom": "DHBVN",
                "latitude": 28.2800,
                "longitude": 76.1500,
                "solar_park": "Mahendragarh High-Irradiance Solar Array",
                "wind_park": "Southern Haryana Wind Feeder",
                "tilt_deg": 28.0,
                "demand_baseline_mw": 60.0,
                "areas": {
                    "narnaul": {
                        "area_name": "Narnaul Solar Interconnect",
                        "substation": "HVPNL 220kV Narnaul Grid",
                        "latitude": 28.0400,
                        "longitude": 76.1100,
                        "solar_park": "Narnaul Solar PV Station",
                        "wind_park": "Aravalli Foothill Wind Feeder",
                        "tilt_deg": 28.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            }
        }
    },
    "kerala": {
        "state_name": "Kerala",
        "grid_operator": "Kerala SLDC (KSEB) / SRLDC",
        "cities": {
            "wayanad": {
                "city_name": "Wayanad (Floating Solar & Hydro)",
                "discom": "KSEBL Wayanad Division",
                "latitude": 11.6050,
                "longitude": 76.0830,
                "solar_park": "Banasura Sagar Floating Solar Plant",
                "wind_park": "Ramakkalmedu & Palakkad Gap Wind",
                "tilt_deg": 11.0,
                "demand_baseline_mw": 50.0,
                "areas": {
                    "banasura": {
                        "area_name": "Banasura Sagar Reservoir Grid",
                        "substation": "KSEB 110kV Padinjarathara Substation",
                        "latitude": 11.6670,
                        "longitude": 75.9570,
                        "solar_park": "Banasura Reservoir Floating Solar Array",
                        "wind_park": "Western Ghats Gap Wind Line",
                        "tilt_deg": 11.0,
                        "demand_baseline_mw": 45.0
                    }
                }
            }
        }
    },
    "odisha": {
        "state_name": "Odisha",
        "grid_operator": "OPTCL / ERLDC",
        "cities": {
            "koraput": {
                "city_name": "Koraput (Eastern Ghats Solar)",
                "discom": "SOUTHCO / TPWODL",
                "latitude": 18.8135,
                "longitude": 82.7123,
                "solar_park": "Deomali Plateau Solar Project",
                "wind_park": "Damanjodi Wind Turbine Fleet",
                "tilt_deg": 19.0,
                "demand_baseline_mw": 55.0,
                "areas": {
                    "deomali": {
                        "area_name": "Deomali High Altitude Feeder",
                        "substation": "OPTCL 220kV Jeypore-Koraput Station",
                        "latitude": 18.7800,
                        "longitude": 82.9800,
                        "solar_park": "Deomali Hilltop Solar PV Farm",
                        "wind_park": "Damanjodi Ridge Wind Line",
                        "tilt_deg": 19.0,
                        "demand_baseline_mw": 45.0
                    }
                }
            }
        }
    },
    "west_bengal": {
        "state_name": "West Bengal",
        "grid_operator": "WBSETCL / ERLDC",
        "cities": {
            "purulia": {
                "city_name": "Purulia (Pumped Storage & Solar)",
                "discom": "WBSEDCL",
                "latitude": 23.3320,
                "longitude": 86.3650,
                "solar_park": "Ayodhya Hills Solar PV Cluster",
                "wind_park": "Purulia Plateau Wind Feeder",
                "tilt_deg": 23.0,
                "demand_baseline_mw": 65.0,
                "areas": {
                    "ayodhya": {
                        "area_name": "Ayodhya Hills Storage & Solar Grid",
                        "substation": "WBSETCL 400kV Purulia Pumped Station",
                        "latitude": 23.2100,
                        "longitude": 86.1200,
                        "solar_park": "Ayodhya Solar PV Plant",
                        "wind_park": "Ranchi-Purulia Wind Link",
                        "tilt_deg": 23.0,
                        "demand_baseline_mw": 55.0
                    }
                }
            }
        }
    },
    "bihar": {
        "state_name": "Bihar",
        "grid_operator": "BSPTCL / ERLDC",
        "cities": {
            "gaya": {
                "city_name": "Gaya (Magadh Solar Corridor)",
                "discom": "SBPDCL",
                "latitude": 24.7955,
                "longitude": 85.0002,
                "solar_park": "Sherghati Mega Solar Array",
                "wind_park": "Magadh Wind Feeder",
                "tilt_deg": 25.0,
                "demand_baseline_mw": 70.0,
                "areas": {
                    "sherghati": {
                        "area_name": "Sherghati Solar Feeder",
                        "substation": "BSPTCL 220kV Gaya Substation",
                        "latitude": 24.5600,
                        "longitude": 84.7900,
                        "solar_park": "Sherghati Ground-Mount Solar",
                        "wind_park": "South Bihar Wind Link",
                        "tilt_deg": 25.0,
                        "demand_baseline_mw": 60.0
                    }
                }
            }
        }
    },
    "assam": {
        "state_name": "Assam",
        "grid_operator": "AEGCL / NERLDC",
        "cities": {
            "amguri": {
                "city_name": "Amguri (Assam Mega Solar Park)",
                "discom": "APDCL",
                "latitude": 26.7500,
                "longitude": 94.2100,
                "solar_park": "Amguri 70 MW Solar Park",
                "wind_park": "Brahmaputra Valley Wind Feeder",
                "tilt_deg": 26.0,
                "demand_baseline_mw": 45.0,
                "areas": {
                    "sivasagar": {
                        "area_name": "Sivasagar Substation",
                        "substation": "AEGCL 132kV Amguri Substation",
                        "latitude": 26.9800,
                        "longitude": 94.6300,
                        "solar_park": "Amguri Central Solar Field",
                        "wind_park": "Upper Assam Wind Link",
                        "tilt_deg": 26.0,
                        "demand_baseline_mw": 40.0
                    }
                }
            }
        }
    },
    "himachal_pradesh": {
        "state_name": "Himachal Pradesh",
        "grid_operator": "HPPTCL / NRLDC",
        "cities": {
            "spiti": {
                "city_name": "Spiti Valley (High-Altitude Cold Solar)",
                "discom": "HPSEBL",
                "latitude": 32.2400,
                "longitude": 77.1800,
                "solar_park": "Spiti 1000 MW High-Altitude Solar Park",
                "wind_park": "Rohtang Pass Alpine Wind Line",
                "tilt_deg": 32.0,
                "demand_baseline_mw": 35.0,
                "areas": {
                    "kaza": {
                        "area_name": "Kaza Cold Arid Solar Grid",
                        "substation": "HPPTCL 66kV Kaza Substation",
                        "latitude": 32.2200,
                        "longitude": 78.0700,
                        "solar_park": "Spiti Valley Cold Array",
                        "wind_park": "Himalayan Ridge Wind Turbines",
                        "tilt_deg": 32.0,
                        "demand_baseline_mw": 30.0
                    }
                }
            }
        }
    },
    "uttarakhand": {
        "state_name": "Uttarakhand",
        "grid_operator": "PTCUL / NRLDC",
        "cities": {
            "haridwar": {
                "city_name": "Haridwar (Industrial Green Grid)",
                "discom": "UPCL",
                "latitude": 29.9457,
                "longitude": 78.1642,
                "solar_park": "Haridwar Solar Network",
                "wind_park": "Foothill Wind Feeder",
                "tilt_deg": 30.0,
                "demand_baseline_mw": 80.0,
                "areas": {
                    "sidcul": {
                        "area_name": "SIDCUL Integrated Industrial Grid",
                        "substation": "PTCUL 220kV SIDCUL Haridwar",
                        "latitude": 29.9700,
                        "longitude": 78.0600,
                        "solar_park": "SIDCUL Rooftop & Ground Solar",
                        "wind_park": "Ganga Canal Wind Link",
                        "tilt_deg": 30.0,
                        "demand_baseline_mw": 75.0
                    }
                }
            }
        }
    },
    "chhattisgarh": {
        "state_name": "Chhattisgarh",
        "grid_operator": "CSPTCL / WRLDC",
        "cities": {
            "rajnandgaon": {
                "city_name": "Rajnandgaon (Solar & BESS Hub 100 MW)",
                "discom": "CSPDCL",
                "latitude": 21.1000,
                "longitude": 81.0300,
                "solar_park": "Rajnandgaon 100 MW Solar + 120 MWh BESS",
                "wind_park": "Central CG Wind Link",
                "tilt_deg": 21.0,
                "demand_baseline_mw": 60.0,
                "areas": {
                    "dongargarh": {
                        "area_name": "Dongargarh Solar Field",
                        "substation": "CSPTCL 132kV Thelkadih Substation",
                        "latitude": 21.1900,
                        "longitude": 80.7600,
                        "solar_park": "SECI Rajnandgaon Solar PV Array",
                        "wind_park": "Durg-Bhilai Wind Link",
                        "tilt_deg": 21.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            }
        }
    },
    "jharkhand": {
        "state_name": "Jharkhand",
        "grid_operator": "JUSNL / ERLDC",
        "cities": {
            "bokaro": {
                "city_name": "Bokaro (Damodar Valley Clean Energy)",
                "discom": "JBVNL / DVC",
                "latitude": 23.6693,
                "longitude": 86.1511,
                "solar_park": "Bokaro Solar Park (DVC)",
                "wind_park": "Chota Nagpur Wind Link",
                "tilt_deg": 23.0,
                "demand_baseline_mw": 90.0,
                "areas": {
                    "chandankiyari": {
                        "area_name": "Chandankiyari Solar Belt",
                        "substation": "JUSNL 220kV Bokaro Grid",
                        "latitude": 23.5700,
                        "longitude": 86.3500,
                        "solar_park": "Bokaro Steel Solar Grid",
                        "wind_park": "Dhanbad Wind Feeder",
                        "tilt_deg": 23.0,
                        "demand_baseline_mw": 80.0
                    }
                }
            }
        }
    },
    "goa": {
        "state_name": "Goa",
        "grid_operator": "Goa Electricity Dept / WRLDC",
        "cities": {
            "panaji": {
                "city_name": "Panaji (Coastal Microgrid)",
                "discom": "Goa Electricity Dept",
                "latitude": 15.4909,
                "longitude": 73.8278,
                "solar_park": "Goa Clean Energy Solar Array",
                "wind_park": "Konkan Coast Wind Farm",
                "tilt_deg": 15.0,
                "demand_baseline_mw": 55.0,
                "areas": {
                    "kadamba": {
                        "area_name": "Kadamba Plateau Substation",
                        "substation": "GED 110kV Kadamba Grid",
                        "latitude": 15.4800,
                        "longitude": 73.8900,
                        "solar_park": "Kadamba Solar Grid",
                        "wind_park": "Mormugao Port Wind Link",
                        "tilt_deg": 15.0,
                        "demand_baseline_mw": 50.0
                    }
                }
            }
        }
    },
    "jammu_kashmir": {
        "state_name": "Jammu & Kashmir",
        "grid_operator": "JKPTCL / NRLDC",
        "cities": {
            "jammu": {
                "city_name": "Jammu (Samba Industrial Solar)",
                "discom": "JPDCL",
                "latitude": 32.7266,
                "longitude": 74.8570,
                "solar_park": "Samba Solar Power Park",
                "wind_park": "Tawi River Wind Corridor",
                "tilt_deg": 33.0,
                "demand_baseline_mw": 75.0,
                "areas": {
                    "samba": {
                        "area_name": "Samba Industrial Area",
                        "substation": "JKPTCL 220kV Samba Substation",
                        "latitude": 32.5500,
                        "longitude": 75.1200,
                        "solar_park": "Samba Ground-Mount Solar",
                        "wind_park": "Jammu-Pathankot Wind Line",
                        "tilt_deg": 33.0,
                        "demand_baseline_mw": 65.0
                    }
                }
            }
        }
    },
    "ladakh": {
        "state_name": "Ladakh",
        "grid_operator": "PGCIL / NRLDC",
        "cities": {
            "pang": {
                "city_name": "Pang (10,000 MW Ultra Mega RE Zone)",
                "discom": "Power Grid Corporation of India (PGCIL)",
                "latitude": 34.1500,
                "longitude": 77.5700,
                "solar_park": "Pang 10 GW High-Altitude Solar & BESS",
                "wind_park": "Changthang Cold-Desert Wind Turbines",
                "tilt_deg": 34.0,
                "demand_baseline_mw": 25.0,
                "areas": {
                    "pang_core": {
                        "area_name": "Pang High-Altitude Inverter Pool",
                        "substation": "PGCIL 765kV Pang Interconnect",
                        "latitude": 34.1500,
                        "longitude": 77.5700,
                        "solar_park": "Pang 100 MW Ultra High Irradiance Block",
                        "wind_park": "Ladakh Aerodynamic Wind Farm",
                        "tilt_deg": 34.0,
                        "demand_baseline_mw": 20.0
                    }
                }
            }
        }
    },
    "delhi": {
        "state_name": "Delhi NCR",
        "grid_operator": "Delhi SLDC (DTL) / NRLDC",
        "cities": {
            "delhi_core": {
                "city_name": "Delhi NCR (Urban Solar Grid)",
                "discom": "BSES Rajdhani / TPDDL",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "solar_park": "Delhi Metro & Airport Rooftop Solar Array",
                "wind_park": "NCR Northern Corridor Wind Feeder",
                "tilt_deg": 28.0,
                "demand_baseline_mw": 165.0,
                "areas": {
                    "dwarka": {
                        "area_name": "Dwarka Sub-City Smart Grid",
                        "substation": "DTL 220kV Dwarka Substation",
                        "latitude": 28.5800,
                        "longitude": 77.0500,
                        "solar_park": "Dwarka Rooftop Solar Cluster",
                        "wind_park": "Haryana-Delhi Wind Interconnect",
                        "tilt_deg": 28.0,
                        "demand_baseline_mw": 155.0
                    }
                }
            }
        }
    }
}
'''

with open("app.py", "r") as f:
    app_text = f.read()

# Replace STATE_CITY_REGISTRY
pattern = r'# -------------------------------------------------------------------------\n# UNIVERSAL 3-TIER INDIAN STATE, CITY & AREA RENEWABLE REGISTRY\n# -------------------------------------------------------------------------[\s\S]*?SOLAR_VARIABLES ='
replacement = f"{registry_code}\nSOLAR_VARIABLES ="

if re.search(pattern, app_text):
    new_app = re.sub(pattern, replacement, app_text)
    with open("app.py", "w") as f:
        f.write(new_app)
    print("Successfully replaced STATE_CITY_REGISTRY with all 24 states!")
else:
    print("Could not find registry pattern. Searching alternate match...")
    alt_pattern = r'STATE_CITY_REGISTRY = {[\s\S]*?SOLAR_VARIABLES ='
    alt_replacement = f"{registry_code}\nSOLAR_VARIABLES ="
    new_app = re.sub(alt_pattern, alt_replacement, app_text)
    with open("app.py", "w") as f:
        f.write(new_app)
    print("Successfully replaced STATE_CITY_REGISTRY with alternate match!")
