const router = require('express').Router();
const {User, Kid, Task, Star } = require('../models');
const moment = require('moment-timezone');

//add a kid to profile
router.post('/', async (req, res) => {
  if(!req.session.logged_in){
    return res.status(401).json({msg:"please login"})
  }
  try {
    console.log(req.body);
    const newKid = await Kid.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newKid);
  } catch (err) {
    res.status(400).json(err);
  }
});

//remove a kid from profile
router.delete('/:id', async (req, res) => {
  if(!req.session.logged_in){
    return res.status(401).json({msg:"please login"})
  }
  try {
    const kidData = await Kid.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!kidData) {
      res.status(404).json({ message: 'No kids found with this id!' });
      return;
    }

    res.status(200).json(kidData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id",(req,res)=>{
  if(!req.session.logged_in){
      return res.redirect("/login")
  }
  Kid.findByPk(req.params.id,{
    include:[
      {model: User, include:[Task]},
      {model: Star, }
    ],
    order: [
      [Star,'updatedAt', 'ASC'],
    ],

  }).then(userData=>{
    const hbsData = userData.toJSON();

    hbsData.logged_in=req.session.logged_in;

    const starleft = hbsData.star_goal_num - hbsData.stars.length;
    hbsData.starsUntilGoal = ( starleft < 0 )? 0 : starleft ;

    // to show tasks in order of task-id
    hbsData.user.task_categories.sort((a, b) => (a.id > b.id) ? 1 : -1);

    //array of object with taskId, taskName & the number of stars of the task that this kid has
    const taskSet = [] ; 
    const colors = ['blue', 'green', 'pink', 'purple', 'yellow','orange', 'navy', 'red', 'aqua'];

    for (let i = 0; i < hbsData.user.task_categories.length ; i++) {
      const starsForThisTask = hbsData.stars.filter(star => star.task_category_id == hbsData.user.task_categories[i].id)      
      const taskSetObj  = { 
        id: hbsData.user.task_categories[i].id, 
        task: hbsData.user.task_categories[i].task, 
        starnum : starsForThisTask.length,
        color: colors[i]
      } 
      taskSet.push(taskSetObj)
    }
    


    // array of object with date, and stars for each date
    const starDateSet = [];

    if ( hbsData.stars.length > 0 ){
    // get the first date from the star array

      let aDate = moment(hbsData.stars[0].updatedAt).format('YYYY-MM-DD');
      
      let taskIdArray = [];
      
      for (let i = 0; i < hbsData.stars.length ; i++) {

        const thisStar = hbsData.stars[i];
        const thisDate = moment(hbsData.stars[i].updatedAt).format('YYYY-MM-DD');

        if ( aDate === thisDate ){
          taskIdArray.push(thisStar.task_category_id)

        } else { 
          // date changed
          // create starDateObject for previous date. and insert to the starDateSet
          
          const starDateSetObj = {
            date : aDate,
            taskColors : taskIdArray.map(taskid => taskSet.find(item => item.id===taskid).color )
          }
          starDateSet.push(starDateSetObj);
          // now create a new array for new date
          taskIdArray = [];
          aDate = thisDate;

          taskIdArray.push(thisStar.task_category_id)
        }
        
      }
      // create starDateObject for the last date. and insert to the starDateSet
      const starDateSetObj = {
        date : aDate,
        taskColors : taskIdArray.map(taskid => taskSet.find(item => item.id===taskid).color)
      }
      starDateSet.push(starDateSetObj);

    } 
  

    hbsData.taskSet = taskSet;
    hbsData.starDateSet = starDateSet;
    hbsData.profile_class_on = "on";
    console.log(hbsData)
    res.render("kidDetail",hbsData)
  })
})

module.exports = router;