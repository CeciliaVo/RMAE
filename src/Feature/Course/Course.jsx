import React, { useState } from 'react';
import { FloatButton, Divider, Modal, Input, Row, Col, Form, Radio, Checkbox, Menu, Dropdown} from 'antd';
import { DownOutlined} from '@ant-design/icons';
import { FaTrashCan } from "react-icons/fa6";
import './Course.css';

const Course = () => {
    const [isOpen, setOpen] = useState(false);
    const [isAllChecked, setIsAllChecked] = useState(false);


    //Create a new course
    const courseYear = new Date().getFullYear();
    const [courseName, setCourseName] = useState('');
    const [courseID, setCourseID] = useState('');
    const [courseSemester, setCourseSemester] = useState(null);
    const [courseSchool, setCourseSchool] = useState(null);
    const [error, setError] = useState('');
    //Display the course
    const [courses, setCourses] = useState([]);
    const courseExists = courses.some(course => course.name === courseName && course.id === courseID && course.semester === courseSemester && course.year === courseYear);

    const showModal = () => {
        setCourseName('');
        setCourseID('');
        setCourseSemester(1);
        setOpen(true);
    };

    const courseCreate = () => {
        if (!courseName || !courseID || !courseSchool) {
        setError('Course Name, Course ID and Course School are required');
        } else {
        // Check if a course with the same name, ID, semester, and year already exists
        if (courseExists) {
            setError('A course with the same name, ID, semester, and year already exists');
        } else {
            setCourses([...courses, { name: courseName, id: courseID, semester: courseSemester, year: courseYear, school:courseSchool, checked: false }]);
            setOpen(false);
            setError('');
        }
        }
    };
  
    const cancelCourseSet = () => {
        setCourseName('');
        setCourseID('');
        setCourseSemester(1);
        setOpen(false);
        setError('');
    };

    //Course manage state
    const selectCourse = index => {
        setCourses(courses.map((course, i) => i === index ? { ...course, checked: !course.checked } : course));
    };

    const selectAllCourse = (coursel) => {
        setIsAllChecked(coursel.target.checked);
        setCourses(courses.map(course => ({ ...course, checked: coursel.target.checked })));
    }; 
    
    const courseDelete = () => {
        setCourses(courses.filter(course => !course.checked));
    };
    

    //School select
    const menu = (
        <Menu onClick={school => setCourseSchool(school.key)}>
        <Menu.Item key="School of Science, Engineering & Technology (SSET)">School of Science, Engineering & Technology (SSET) </Menu.Item>
        <Menu.Item key="The Business School (TBS)" disabled>The Business School (TBS)</Menu.Item>
        <Menu.Item key="SSchool of communications & design (SCD)" disabled>School of communications & design (SCD)</Menu.Item>
        </Menu>
    );

    return (
        <>
        <FloatButton className = "creatCourse-icon" onClick={showModal} style={{position: 'fixed', bottom: '20px', right: '20px',}}>
            Create Course
        </FloatButton>
        <Modal className="custom-modal-course" title="Create Course" open={isOpen} onOk={courseCreate} onCancel={cancelCourseSet} width={700} okButtonProps={{ className: 'custom-ok-button' }}>
            <Form layout="inline">
                <Form.Item label = 'Name' className="coursename">
                    <Input className="cnameholder" placeholder="" value={courseName} onChange={cname => setCourseName(cname.target.value)} />
                </Form.Item>
                <Form.Item label = 'ID' className="courseid">
                    <Input className="cidholder" placeholder="" value={courseID} onChange={cid => setCourseID(cid.target.value)} />
                </Form.Item>
                <Form.Item label = 'Semester' className="coursesemester" rules={[{ required: true, message: 'Please select a semester!' }]}>
                    <Radio.Group className="custom-radio-group" onChange={sem => setCourseSemester(sem.target.value)} value={courseSemester}>
                        <Radio value={1}>1</Radio>
                        <Radio value={2}>2</Radio>
                        <Radio value={3}>3</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item label = 'School' className="courseschool" rules={[{ required: true, message: 'Please select school!' }]}>
                    <Dropdown overlay={menu}>
                    <a className="dropdown-school" onClick={schoolsel => schoolsel.preventDefault()}>
                        {courseSchool || 'Select school of the course '} <DownOutlined />
                    </a>
                    </Dropdown>
                </Form.Item>
            </Form>
            {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}
        </Modal>

        {/*Manage course*/}
        <div className="breadcrumbcourse">
            {courses.some(course => course.checked) && <FaTrashCan className='deletecourseicon' size='18px' onClick={courseDelete} />}
            <Checkbox className='checkallcourse'checked={isAllChecked} onChange={selectAllCourse}>Select all</Checkbox>
        </div>

        <div className="courses-container">
            {/* Course information title */}
            <Row className="courseinfo">
                <Col span={1}><b></b></Col>
                <Col span={8}><div className="course-label"><b>NAME:</b></div></Col>
                <Col span={5}><div className="course-label"><b>ID:</b></div></Col>
                <Col span={7}><div className="course-label"><b>SCHOOL:</b></div></Col>
            </Row>

            {courses.sort((a, b) => a.year !== b.year ? a.year - b.year : a.semester - b.semester).map((course, index, arr) => (
                <>
                    {(index === 0 || course.year !== arr[index - 1].year || course.semester !== arr[index - 1].semester) && 
                        <Divider className = "course-time-arrange" orientation="left"> SEMESTER {course.semester}, {courseYear}</Divider>
                    }
                    <CourseDisplay key={index} course={course} onCheckboxChange={() => selectCourse(index)} />
                </>
            ))}
        </div>
    </>
  );
};

//Whenever the user create a new course, the course will be added.
const CourseDisplay = ({ course, onCheckboxChange }) => (
    <div className={course.checked ? 'row-checked' : ''}>
        <Row className="displaycourse">
            <Col span={1}><Checkbox className='checkboxcourse' checked={course.checked} onChange={onCheckboxChange} /></Col>
            
            <Col span={8} className="course-name">{course.name}</Col>
            
            <Col span={5}>{course.id}</Col>
            <Col span={7}>{course.school}</Col>
        </Row>
    </div>
);

export default Course;