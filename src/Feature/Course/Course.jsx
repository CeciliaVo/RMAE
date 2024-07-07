import { useEffect, useState } from "react";
import {
  FloatButton,
  Divider,
  Modal,
  Input,
  Row,
  Col,
  Form,
  Radio,
  Checkbox,
  Menu,
  Dropdown,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { FaTrashCan } from "react-icons/fa6";
import { CourseEndpoint, SchoolEndpoint } from "../../constants/endpoints";
import request, { displaySuccessMessage } from "../../utils/request";
import { useForm } from "antd/es/form/Form";
import { useNavigate } from 'react-router-dom';
import "./Course.css";

const initSchoolValues = {
  id: null,
  name: "",
};

const Course = () => {
  const navigate = useNavigate();
  const [form] = useForm();
  const [isOpen, setOpen] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);

  //Trigger re-render
  const [keyCount, setKeyCount] = useState(0)
  //Create a new course
  const [courseSchool, setCourseSchool] = useState(initSchoolValues);
  const [error, setError] = useState("");
  //School
  const [schools, setSchools] = useState([]);
  //Display the course
  const [courses, setCourses] = useState([]);

  const showModal = () => {
    setOpen(true);
  };

  const fetchCourses = async () => {
    const endpoint = CourseEndpoint["search"];
    const resp = await request.get(endpoint);
    setCourses(resp);
  };

  const fetchSchools = async () => {
    const endpoint = SchoolEndpoint["search"];
    const resp = await request.get(endpoint);
    setSchools(resp);
  };
  useEffect(() => {
    fetchCourses();
    fetchSchools();
  }, [keyCount]);

  const cancelCourseSet = () => {
    setOpen(false);
    setError("");
  };

  //Course manage state
  const selectCourse = (index) => {
    setCourses(
      courses.map((course, i) =>
        i === index ? { ...course, checked: !course.checked } : course
      )
    );
  };

  const selectAllCourse = (coursel) => {
    setIsAllChecked(coursel.target.checked);
    setCourses(
      courses.map((course) => ({ ...course, checked: coursel.target.checked }))
    );
  };

  const courseDelete = () => {
    setCourses(courses.filter((course) => !course.checked));
  };

  const handleSchoolClick = (e) => {
    const selectedSchool = schools.find(
      (school) => school.id === parseInt(e.key)
    );
    console.log(selectedSchool);
    setCourseSchool(selectedSchool);
    form.setFieldsValue({ school_id: selectedSchool.id });
  };

  //School select
  const menu = (
    <Menu onClick={handleSchoolClick}>
      {schools.map((sc) => {
        return <Menu.Item key={sc.id}>{sc.name}</Menu.Item>;
      })}
    </Menu>
  );

  const onSubmit = async () => {
    const value = form.getFieldValue();
    const endpoint = CourseEndpoint["add"];
    const resp = await request.post(endpoint, value);
    console.log(resp.status_code)
    setOpen(false)
    displaySuccessMessage("Added new course")
    setKeyCount(keyCount+1)
  };

  const handleViewAssignment = (courseID) => {
    navigate(`/asm/${courseID}`)
  }

  return (
    <>
      <FloatButton
        className="creatCourse-icon"
        onClick={showModal}
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
      >
        Create Course
      </FloatButton>
      <Modal
        className="custom-modal-course"
        title="Create Course"
        open={isOpen}
        onOk={() => form.submit()}
        onCancel={cancelCourseSet}
        width={700}
        okButtonProps={{ className: "custom-ok-button" }}
      >
        <Form layout="inline" form={form} onFinish={onSubmit}>
          <Form.Item
            name="name"
            label="Name"
            className="coursename"
            rules={[{ required: true, message: "Please enter course name!" }]}
          >
            <Input className="cnameholder" placeholder="Course's name" />
          </Form.Item>
          <Form.Item
            name="code"
            label="Code"
            className="courseid"
            rules={[{ required: true, message: "Please enter course code!" }]}
          >
            <Input className="cidholder" placeholder="Course's code" />
          </Form.Item>
          <Form.Item
            name="year"
            label="Year"
            className="courseid"
            rules={[{ required: true, message: "Please enter course year!" }]}
          >
            <Input className="cidholder" placeholder="Course's year" />
          </Form.Item>
          <Form.Item
            name="semester"
            label="Semester"
            className="coursesemester"
            rules={[{ required: true, message: "Please select a semester!" }]}
          >
            <Radio.Group className="custom-radio-group">
              <Radio value={"1"}>1</Radio>
              <Radio value={"2"}>2</Radio>
              <Radio value={"3"}>3</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="school_id"
            label="School"
            className="courseschool"
            rules={[{ required: true, message: "Please select school!" }]}
          >
            <Dropdown overlay={menu} trigger={["click"]}>
              <a
                className="dropdown-school"
                onClick={(schoolsel) => schoolsel.preventDefault()}
              >
                {courseSchool?.name || "Select school of the course "}{" "}
                <DownOutlined />
              </a>
            </Dropdown>
          </Form.Item>
        </Form>
        {error && (
          <div style={{ color: "red", marginTop: "20px" }}>{error}</div>
        )}
      </Modal>

      {/*Manage course*/}
      <div className="breadcrumbcourse">
        {courses.some((course) => course.checked) && (
          <FaTrashCan
            className="deletecourseicon"
            size="18px"
            onClick={courseDelete}
          />
        )}
        <Checkbox
          className="checkallcourse"
          checked={isAllChecked}
          onChange={selectAllCourse}
        >
          Select all
        </Checkbox>
      </div>

      <div className="courses-container">
        {/* Course information title */}
        <Row className="courseinfo">
          <Col span={1}></Col>
          <Col span={8} className="course-label">NAME</Col>
          <Col span={5} className="course-label">CODE</Col>
          <Col span={7} className="course-label">SCHOOL</Col>
        </Row>

        {courses
          .sort((a, b) =>
            a.year !== b.year ? a.year - b.year : a.semester - b.semester
          )
          .map((course, index, arr) => (
            <>
              {(index === 0 ||
                course.year !== arr[index - 1].year ||
                course.semester !== arr[index - 1].semester) && (
                <Divider className="course-time-arrange" orientation="left">
                  {" "}
                  SEMESTER {course.semester}, {course.year}
                </Divider>
              )}
              <CourseDisplay
                key={index}
                course={course}
                onCheckboxChange={() => selectCourse(index)}
                handleViewAssignment={() => handleViewAssignment(course.id)}
              />
            </>
          ))}
      </div>
    </>
  );
};

//Whenever the user create a new course, the course will be added.
const CourseDisplay = ({ course, onCheckboxChange, handleViewAssignment }) => (
  <div className={course.checked ? "row-checked" : ""}>
    <Row className="displaycourse">
      <Col span={1}>
        <Checkbox
          className="checkboxcourse"
          checked={course?.checked || false}
          onChange={onCheckboxChange}
        />
      </Col>

      <Col span={8} className="course-name">
        <div onClick={() => handleViewAssignment()}>
        {course.name}
        </div>
      </Col>

      <Col span={5}>{course.code}</Col>
      <Col span={7}>{course.school.name}</Col>
    </Row>
  </div>
);

export default Course;
