import React, { useState } from "react";
import data from "./data.json";
import "antd/dist/antd.css";
import "./index.css";
import {
  Layout,
  Menu,
  Breadcrumb,
  Table,
  Form,
  InputNumber,
  Button,
} from "antd";

const { Header, Content, Footer } = Layout;

function App() {
  // Number of surgeons and available minutes for each service area
  const serviceList = [
    {
      service: "Vascular",
      surgeon_count: 3,
      surgeon_minutes: 5400,
    },
    {
      service: "Neurosurgery",
      surgeon_count: 7,
      surgeon_minutes: 12600,
    },
    {
      service: "ENT",
      surgeon_count: 15,
      surgeon_minutes: 27000,
    },
    {
      service: "Gastroenterology",
      surgeon_count: 14,
      surgeon_minutes: 25200,
    },
    {
      service: "Ophthalmology",
      surgeon_count: 15,
      surgeon_minutes: 27000,
    },
    {
      service: "Pulmonary",
      surgeon_count: 8,
      surgeon_minutes: 14400,
    },
    {
      service: "General",
      surgeon_count: 29,
      surgeon_minutes: 52200,
    },
    {
      service: "Orthopedics",
      surgeon_count: 17,
      surgeon_minutes: 30600,
    },
    {
      service: "Hand",
      surgeon_count: 2,
      surgeon_minutes: 3600,
    },
    {
      service: "Cardiovascular",
      surgeon_count: 16,
      surgeon_minutes: 28800,
    },
    {
      service: "Plastics",
      surgeon_count: 2,
      surgeon_minutes: 3600,
    },
    {
      service: "Urology",
      surgeon_count: 4,
      surgeon_minutes: 7200,
    },
    {
      service: "Cardiothoracic",
      surgeon_count: 3,
      surgeon_minutes: 5400,
    },
    {
      service: "Gynecology",
      surgeon_count: 17,
      surgeon_minutes: 30600,
    },
    {
      service: "Ortho Total Joints",
      surgeon_count: 4,
      surgeon_minutes: 7200,
    },
    {
      service: "Obstetrics",
      surgeon_count: 11,
      surgeon_minutes: 19800,
    },
    {
      service: "Pain",
      surgeon_count: 2,
      surgeon_minutes: 3600,
    },
    {
      service: "Oral Surgery",
      surgeon_count: 1,
      surgeon_minutes: 1800,
    },
  ];

  const [orCap, setOrCap] = useState(0);
  const [bedsCap, setBedsCap] = useState(1);
  const [icuCap, setIcuCap] = useState(1);

  let fullList = [];
  serviceList.forEach(({ service, surgeon_minutes }) => {
    // Get cases for each service area and sort by highest revenue
    let serviceCases = data
      .filter((e) => e.case_service === service)
      .sort(function (p1, p2) {
        return p2.avg_revenue - p1.avg_revenue;
      });

    let serviceSurgeryMinutes = 0;
    let sumMinutes = 0;
    let i;
    for (i = 0; i < serviceCases.length; i++) {
      const {
        id,
        avg_surgery_minutes,
        avg_los_hours,
        avg_icu_hours,
        count,
        procedure_name,
        avg_revenue,
        case_service,
      } = serviceCases[i];

      // Estimating a month's case count and time from 1 year's data
      serviceSurgeryMinutes = sumMinutes += (avg_surgery_minutes * count) / 12;

      const dataObj = {
        id,
        procedureName: procedure_name,
        revenue: avg_revenue,
        count: count / 12,
        surgeryMinutes: avg_surgery_minutes,
        service: case_service,
        losHours: avg_los_hours,
        icuHours: avg_icu_hours,
      };

      // Cap the number of cases from each service area by available surgeon minutes
      if (serviceSurgeryMinutes <= surgeon_minutes)
        // Combine cases from all service areas that has been capped by available surgeon minutes
        fullList.push(dataObj);
    }
  });

  // Sort cases from all service by highest revenue again
  let sortedFullList = fullList.sort(function (p1, p2) {
    return p2.revenue - p1.revenue;
  });

  // Get a shortlist of cases capped by either OR minutes available, hospital beds available or ICU beds available
  let shortList = [];

  let totalSurgeryMinutes = 0;
  let sumSurgeryMinutes = 0;

  let totalLosHours = 0;
  let sumLosHours = 0;

  let totalIcuHours = 0;
  let sumIcuHours = 0;

  let i;
  for (i = 0; i < sortedFullList.length; i++) {
    const {
      id,
      procedureName,
      revenue,
      count,
      surgeryMinutes,
      service,
      losHours,
      icuHours,
    } = sortedFullList[i];

    // Adjust LOS and ICU hours based on US average
    const adjustedLosHours = losHours / 120;
    const adjustedIcuHours = icuHours / 120;

    totalSurgeryMinutes = sumSurgeryMinutes += surgeryMinutes;
    totalLosHours = sumLosHours += adjustedLosHours;
    totalIcuHours = sumIcuHours += adjustedIcuHours;

    const roundedCount = Math.round(count);
    const losDays = Math.round(losHours / 24);
    const orHours = Math.round((surgeryMinutes / 60) * 10) / 10;
    const formattedRevenue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(revenue);
    const dataObj = {
      id,
      procedureName,
      formattedRevenue,
      roundedCount,
      orHours,
      service,
      losDays,
    };

    if (
      totalSurgeryMinutes <= orCap &&
      totalLosHours <= bedsCap &&
      totalIcuHours <= icuCap
    )
      shortList.push(dataObj);
  }

  const onFinish = (values) => {
    setOrCap(values.or * 60);
    setBedsCap(values.bed * 24 * 7);
    setIcuCap(values.icu * 24 * 7);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const columns = [
    {
      title: "Procedure",
      dataIndex: "procedureName",
      key: "procedureName",
    },
    {
      title: "Department",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Recommended Number",
      dataIndex: "roundedCount",
      key: "roundedCount",
    },
    {
      title: "OR time (Hours)",
      dataIndex: "orHours",
      key: "orHours",
    },
    {
      title: "LOS (Days)",
      dataIndex: "losDays",
      key: "losDays",
    },
    {
      title: "Contribution Margin",
      dataIndex: "formattedRevenue",
      key: "formattedRevenue",
    },
  ];

  return (
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1">Case Prioritization</Menu.Item>
          <Menu.Item key="2">Explore Data</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Case Prioritization</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-content">
          <Form
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="OR Hours Available"
              name="or"
              rules={[
                {
                  required: true,
                  message: "Please input OR hours",
                },
              ]}
            >
              <InputNumber style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              label="Hospital Beds Available"
              name="bed"
              rules={[
                {
                  required: true,
                  message: "Please input number of hospital beds",
                },
              ]}
            >
              <InputNumber style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              label="ICU Beds Available"
              name="icu"
              rules={[
                {
                  required: true,
                  message: "Please input number of ICU beds",
                },
              ]}
            >
              <InputNumber style={{ width: 200 }} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
          <Table columns={columns} dataSource={shortList} />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Avant-garde Health ©2020</Footer>
    </Layout>
  );
}

export default App;
